import {
  all,
  call,
  cancelled,
  delay,
  fork,
  put,
  select,
  take,
  takeLatest,
  takeLeading,
} from 'redux-saga/effects';
import {
  FETCH_SUBMISSION,
  SAVE_FORM,
  SAVE_FORM_SUCCESS,
  SUBMIT_FORM,
  SUBMIT_FORM_START,
  UPDATE_SUBMISSION,
  UPDATE_SUBMISSION_SUCCESS,
  UPLOAD_FILES,
} from './constants';
import {
  makeSelectBrokerSubmissionId,
  makeSelectContributors,
  makeSelectDatasetLabels,
  makeSelectEmbargoDate,
  makeSelectFileUploads,
  makeSelectFormWrapper,
  makeSelectGeneralError,
  makeSelectLicense,
  makeSelectMetaDataIndex,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
  makeSelectRelatedPublications,
  makeSelectRequestBrokerSubmissionId,
  makeSelectToken,
  makeSelectUpdateWithRelease,
  makeSelectUserId,
} from './selectors';
import {
  closeSaveSuccess, fetchFileUploadsError, fetchFileUploadsSuccess,
  fetchSubmissionError,
  fetchSubmissionSuccess,
  saveForm,
  saveFormError,
  saveFormSuccess,
  submitFormError,
  submitFormStart,
  submitFormSuccess,
  updateSubmission,
  updateSubmissionError,
  updateSubmissionSuccess,
  updateSubmissionSuccessSubmit,
  uploadFileError,
  uploadFileProgress,
  uploadFilesSuccess,
  uploadFileSuccess,
} from './actions';
import {
  createUploadFileChannel,
  getSubmission, getSubmissionUploads,
  postSubmission,
  putSubmission,
} from './submissionApi';
import dateFormat from 'dateformat';

import { push } from 'connected-react-router/immutable';

function* getMetaDataFileName(metaDataIndex, fileUploads) {
  const metaIndex = parseInt(metaDataIndex);
  const metaDataFile = fileUploads.get(metaIndex);
  let metaDataFileName = '';
  if (metaDataFile !== undefined) {
    metaDataFileName = metaDataFile.file.name;
  }
  return metaDataFileName;
}

// TODO: move logic to utils.js. here only workflow
function* prepareRequestData(userId, submit = true) {
  const form = yield select(makeSelectFormWrapper());
  const formWrapper = form.formWrapper || {};
  let formValues = formWrapper.values || {};
  let legal_requirements = [];
  let categories = [];
  for (let f in formValues) {
    if (f.includes('legal-requirement')) {
      if (formValues[f] === true) {
        legal_requirements.push(f.replace('legal-requirement ', ''));
      }
      delete formValues[f];
    }
    if (f.includes('data-category')) {
      if (formValues[f] === true) {
        categories.push(f.replace('data-category ', ''));
      }
      delete formValues[f];
    }
  }
  const license = yield select(makeSelectLicense());
  const metadata_schema = yield select(makeSelectMetaDataSchema());
  const related_publications = yield select(makeSelectRelatedPublications());
  const dataset_labels = yield select(makeSelectDatasetLabels());
  const contributors = yield select(makeSelectContributors());

  const embargoDate = yield select(makeSelectEmbargoDate());
  const embargo = dateFormat(embargoDate, 'yyyy-mm-dd');

  const metaDataIndex = yield select(makeSelectMetaDataIndex());
  const fileUploads = yield select(makeSelectFileUploads());
  const metaDataFileName = yield getMetaDataFileName(metaDataIndex, fileUploads);

  const requirements = Object.assign({
    license,
    metadata_schema,
    legal_requirements,
    related_publications,
    dataset_labels,
    categories,
    contributors,
    metaDataIndex,
    metaDataFileName,
  }, formValues);
  return {
    // TODO: determine target according to "Target Data center" value. e.g. "ena" = ENA_PANGAEA
    // TODO: change name of non-molecular to sth. else
    target: 'GENERIC',
    release: submit, // false for save
    submitting_user: userId,
    // FIXME: url regex in backend schema does not match this
    // TODO: good chance to show errors responded from server validation
    download_url: formValues.download_url,
    // FIXME: this sends ISO with timezone, but server does not like it
    // embargo: embargoDate https://www.npmjs.com/package/dateformat,
    embargo,
    data: {
      requirements: requirements,
    },
  };
}

function* uploadProgressWatcher(channel, index) {
  while (true) {
    try {
      const progress = yield take(channel);
      yield put(uploadFileProgress(index, progress));
    } catch (err) {
      yield put(uploadFileError(index, err));
    } finally {
      yield put(uploadFileSuccess(index));
      if (yield cancelled()) {
        channel.close();
      }
    }
  }
}

function* uploadFile(token, brokerSubmissionId, file, index) {
  // TODO: move to performUploadSaga. before loop.
  // const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  // const token = yield select(makeSelectToken());
  try {
    // true refers to 'attach_to_ticket' parameter of backend endpoint
    //  stating that every uploaded file will be attached to the
    //  respective ticket
    const uploadChannel = yield call(createUploadFileChannel,
      brokerSubmissionId, file.file, true, token);
    yield fork(uploadProgressWatcher, uploadChannel, index);
  } catch (err) {
    yield put(uploadFileError(index, err));
  }
}

function* performUploadSaga(brokerSubmissionId) {
  const fileUploads = yield select(makeSelectFileUploads());
  // const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  const token = yield select(makeSelectToken());
  let index = 0;
  for (let f of fileUploads) {
    yield call(uploadFile, token, brokerSubmissionId, f, index);
    index++;
  }
  yield put(uploadFilesSuccess({}));
}


export function* performSubmitFormSaga() {
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  if (brokerSubmissionId !== '') {
    yield put(updateSubmission(true));
  } else {
    const token = yield select(makeSelectToken());
    const userId = yield select(makeSelectUserId());
    const payload = yield prepareRequestData(userId, true);
    try {
      const response = yield call(postSubmission, token, payload);
      yield call(performUploadSaga, response.data.broker_submission_id);
      yield put(submitFormSuccess(response));
      yield put(push('/list'));
    } catch (error) {
      yield put(submitFormError(error));
    }
  }
}

export function* performSaveFormSaga() {
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  // TODO: if bsi put update action ....
  if (brokerSubmissionId !== '') {
    yield put(updateSubmission(false));
  } else {
    const token = yield select(makeSelectToken());
    const userId = yield select(makeSelectUserId());
    const payload = yield prepareRequestData(userId, false);
    try {
      const response = yield call(postSubmission, token, payload);
      yield call(performUploadSaga, response.data.broker_submission_id);
      yield put(saveFormSuccess(response));
      // yield put(push('/list'));
    } catch (error) {
      yield put(saveFormError(error));
    }
  }
}

export function* performUpdateSubmissionSaga() {
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  const updateWithRelease = yield select(makeSelectUpdateWithRelease());
  const payload = yield prepareRequestData(userId, updateWithRelease);
  try {
    const response = yield call(putSubmission, token, brokerSubmissionId, payload);
    // TODO: updates of file are handled in extra story
    // NOOPE: yield put(uploadFiles());
    // yield call(performUploadSaga);
    yield call(performUploadSaga, brokerSubmissionId);
    if (updateWithRelease) {
      yield put(updateSubmissionSuccessSubmit(response));
      yield put(push('/list'));
    } else {
      yield put(updateSubmissionSuccess(response));
    }
  } catch (error) {
    yield put(updateSubmissionError(error));
  }
}

export function* processSubmitFormTypeSaga() {
  const generalError = yield select(makeSelectGeneralError());
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  if (generalError) {
    yield put(submitFormError());
  } else if (reduxFormForm.workflow === 'save') {
    yield put(saveForm());
  } else if (reduxFormForm.workflow === 'submit') {
    yield put(submitFormStart());
  }
}

export function* performFetchSubmissionSaga() {
  const token = yield select(makeSelectToken());
  const bsi = yield select(makeSelectRequestBrokerSubmissionId());
  try {
    const response = yield call(getSubmission, token, bsi);
    yield put(fetchSubmissionSuccess(response));
  } catch (error) {
    yield put(fetchSubmissionError(error));
  }
  // console.log('performFetchSubmissionSaga');
  // console.log('get uploads');
  try {
    const response = yield call(getSubmissionUploads, token, bsi);
    // console.log('response');
    // console.log(response);
    yield put(fetchFileUploadsSuccess(response));
  } catch (error) {
    // console.log('error');
    // console.log(error);
    yield put(fetchFileUploadsError(error));
  }
}

export function* performCloseSaveMessageSaga() {
  yield delay(2000);
  yield put(closeSaveSuccess());
}


export function* checkFormTypeSaga() {
  // new feature from rc1 that blocks until finished
  // https://redux-saga.js.org/docs/api/index.html#takeleadingpattern-saga-args
  yield takeLeading(SUBMIT_FORM, processSubmitFormTypeSaga);
}

export function* submitFormSaga() {
  yield takeLeading(SUBMIT_FORM_START, performSubmitFormSaga);
}

export function* saveFormSaga() {
  yield takeLeading(SAVE_FORM, performSaveFormSaga);
}

// TODO: adapt upload workflow for submit
/*
current save workflow with upload:
==================================
- SAVE_FORM is taken, triggers performSaveFormSaga
- this posts a submission with submit=False
- if errors dispatch saveFormError via put
- if success (brokersubmissionid) dispatch saveFormSuccess
  and dispatch uploadFiles
- UPLOAD_FILES is taken, triggers performUploadSaga
- this gets fileUploads from current state and iterates over it, while counting an index
- every iteration a call() to uploadFile is send with file and index as parameters (yield all not working currently ?)
- uploadFile calls and gets an uploadChannel from createUploadFileChannel and
- forks a uploadProgressWatcher with the channel and the index
- uploadProgressWatcher watches the upload progress (of axios onUploadProgress event triggered in createUploadFileChannel)
- dispatches uploadFileProgress action which updates state for file at index, and watches for errors.

TODO: dispatch error for single file, everywhere error is expected/ try-catched
TODO: set property in single file capture status success/error/finished
TODO: dispatch action all_files_uploaded success/error
TODO: block remove button, when save/submit working (modify upload list not possible after start of submission)
TODO: no re-upload of already uploaded files -> set property, compare above
TODO: style file list, position etc
TODO: real upload bar instead of numeric progress

TODO: when in edit mode: remove file means delete already uploaded file.

*/

export function* closeSaveMessageSaga() {
  yield takeLatest(SAVE_FORM_SUCCESS, performCloseSaveMessageSaga);
  yield takeLatest(UPDATE_SUBMISSION_SUCCESS, performCloseSaveMessageSaga);
}

export function* uploadFilesSaga() {
  yield takeLatest(UPLOAD_FILES, performUploadSaga);
}

export function* fetchSubmissionSaga() {
  yield takeLatest(FETCH_SUBMISSION, performFetchSubmissionSaga);
}

export function* updateSubmissionSaga() {
  yield takeLeading(UPDATE_SUBMISSION, performUpdateSubmissionSaga);
}

export default function* rootSaga() {
  yield all([checkFormTypeSaga(), saveFormSaga(), submitFormSaga(),
    uploadFilesSaga(), fetchSubmissionSaga(), updateSubmissionSaga(),
    closeSaveMessageSaga(),
  ]);
}

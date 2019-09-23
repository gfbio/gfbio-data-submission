import {
  all,
  call,
  cancelled,
  delay,
  fork,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
  takeLeading,
} from 'redux-saga/effects';
import {
  DELETE_FILE,
  FETCH_SUBMISSION,
  SAVE_FORM,
  SAVE_FORM_SUCCESS,
  SET_METADATA_ON_SERVER,
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
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
  makeSelectRelatedPublications,
  makeSelectRequestBrokerSubmissionId,
  makeSelectToken,
  makeSelectUpdateWithRelease,
  makeSelectUserId,
} from './selectors';
import {
  closeSaveSuccess,
  deleteFileError,
  deleteFileSuccess,
  fetchFileUploadsError,
  fetchFileUploadsSuccess,
  fetchSubmissionError,
  fetchSubmissionSuccess,
  postCommentError,
  postCommentSuccess,
  saveForm,
  saveFormError,
  saveFormSuccess,
  setMetaDataOnServerError,
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
  deleteSubmissionUpload,
  getSubmission,
  getSubmissionUploads,
  postComment,
  postSubmission,
  putSubmission,
  setMetaDataFlag,
} from './submissionApi';
import dateFormat from 'dateformat';

import { push } from 'connected-react-router/immutable';

// TODO: move logic to utils.js. here only workflow
function* prepareRequestData(userId, submit = true) {
  const form = yield select(makeSelectFormWrapper());
  const formWrapper = form.formWrapper || {};
  let formValues = formWrapper.values || {};

  console.info('FORMVALUES');
  console.info(formValues);
  let comment = formValues.comment || '';
  console.info('COMMENT');
  console.info(comment);

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

  const requirements = Object.assign({
    license,
    metadata_schema,
    legal_requirements,
    related_publications,
    dataset_labels,
    categories,
    contributors,
  }, formValues);

  let res = {
    // TODO: determine target according to "Target Data center" value. e.g. "ena" = ENA_PANGAEA
    // TODO: change name of non-molecular to sth. else
    target: 'GENERIC',
    release: submit, // false for save
    submitting_user: userId,
    // FIXME: url regex in backend schema does not match this
    // TODO: good chance to show errors responded from server validation
    download_url: formValues.download_url,
    // FIXME: this sends ISO with timezone, but server does not like it
    embargo,
    data: {
      requirements: requirements,
    },
  };
  return { payload: res, comment: comment };
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
  try {
    // true refers to 'attach_to_ticket' parameter of backend endpoint
    //  stating that every uploaded file will be attached to the
    //  respective ticket
    const uploadChannel = yield call(createUploadFileChannel,
      brokerSubmissionId, file.file, true, file.metaData, token);
    yield fork(uploadProgressWatcher, uploadChannel, index);
  } catch (err) {
    yield put(uploadFileError(index, err));
  }
}

function* performUploadSaga(brokerSubmissionId) {
  const fileUploads = yield select(makeSelectFileUploads());
  const token = yield select(makeSelectToken());
  let index = 0;
  for (let f of fileUploads) {
    yield call(uploadFile, token, brokerSubmissionId, f, index);
    index++;
  }
  yield put(uploadFilesSuccess({}));
}

function* performPostCommentSaga(brokerSubmissionId, commentText) {
  const token = yield select(makeSelectToken());
  console.info('performPostCommentSaga ' + token + ' | ' + commentText);
  try {
    const response = yield call(postComment, token, brokerSubmissionId, commentText);
    console.info('Success. resonse ');
    console.info(response);
    yield put(postCommentSuccess(response));
  } catch (error) {
    console.info('Error. error ');
    console.info(error);
    yield put(postCommentError(error));
  }
}

export function* performSubmitFormSaga() {
  console.info('performSubmitFormSaga');
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  if (brokerSubmissionId !== '') {
    yield put(updateSubmission(true));
  } else {
    const token = yield select(makeSelectToken());
    const userId = yield select(makeSelectUserId());
    const requestData = yield prepareRequestData(userId, true);
    try {
      const response = yield call(postSubmission, token, requestData.payload);
      yield call(performUploadSaga, response.data.broker_submission_id);
      yield call(performPostCommentSaga, response.data.broker_submission_id, requestData.comment);
      yield put(submitFormSuccess(response));
      yield put(push('/list'));
    } catch (error) {
      yield put(submitFormError(error));
    }
  }
}

export function* performSaveFormSaga() {
  console.info('performSaveFormSaga');
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  let bsi = 'no_brokersubmission_id';
  // TODO: if bsi put update action ....
  if (brokerSubmissionId !== '') {
    yield put(updateSubmission(false));
  } else {
    const token = yield select(makeSelectToken());
    const userId = yield select(makeSelectUserId());
    const requestData = yield prepareRequestData(userId, false);
    try {
      let response = yield call(postSubmission, token, requestData.payload);
      bsi = response.data.broker_submission_id;
      yield call(performUploadSaga, bsi);
      yield call(performPostCommentSaga, bsi, requestData.comment);
      yield put(saveFormSuccess(response));
      yield put(push('/list'));
    } catch (error) {
      yield put(saveFormError(error));
    }
  }
}

export function* performUpdateSubmissionSaga() {
  console.info('performUpdateSubmissionSaga');
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  const updateWithRelease = yield select(makeSelectUpdateWithRelease());
  const requestData = yield prepareRequestData(userId, updateWithRelease);
  console.info('PAYLOAD');
  console.info(requestData.payload);
  console.info('COMMENT');
  console.info(requestData.comment);
  try {
    let response = yield call(putSubmission, token, brokerSubmissionId, requestData.payload);
    // TODO: updates of file are handled in extra story
    // NOOPE: yield put(uploadFiles());
    // yield call(performUploadSaga);
    yield call(performUploadSaga, brokerSubmissionId);
    yield call(performPostCommentSaga, brokerSubmissionId, requestData.comment);
    if (updateWithRelease) {
      // TODO: currently this is the only update worklow active (hidden save button)
      yield put(updateSubmissionSuccessSubmit(response));
      yield put(push('/list'));
    } else {
      yield put(updateSubmissionSuccess(response));
      yield put(push('/list'));
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
  try {
    const response = yield call(getSubmissionUploads, token, bsi);
    yield put(fetchFileUploadsSuccess(response));
  } catch (error) {
    yield put(fetchFileUploadsError(error));
  }
}

// TODO: when providing no parameter in listening saga (take ACTION etc..)
//  first declared paramter IS the actual action per default, as defined as in
//  actions.js containing type and paramter(s). accessible like in reducer.
export function* performDeleteUploadedFileSaga(action) {
  const token = yield select(makeSelectToken());
  const bsi = yield select(makeSelectRequestBrokerSubmissionId());

  try {
    let response = yield call(deleteSubmissionUpload, token, bsi, action.fileKey);
    yield put(deleteFileSuccess(response));
    response = yield call(getSubmissionUploads, token, bsi);
    yield put(fetchFileUploadsSuccess(response));
  } catch (error) {
    yield put(deleteFileError(error));
  }
}

export function* performUpdateUploadedFileSaga(action) {
  const token = yield select(makeSelectToken());
  // const bsi = yield select(makeSelectRequestBrokerSubmissionId());
  const bsi = yield select(makeSelectBrokerSubmissionId());
  try {
    let response = yield call(setMetaDataFlag, bsi, action.file.pk, action.file.meta_data, token);
  } catch (error) {
    yield put(setMetaDataOnServerError(error));
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

export function* updateUploadedFilesSaga() {
  yield takeEvery(SET_METADATA_ON_SERVER, performUpdateUploadedFileSaga);
}

export function* deleteUploadedFileSaga() {
  yield takeLeading(DELETE_FILE, performDeleteUploadedFileSaga);
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
    closeSaveMessageSaga(), deleteUploadedFileSaga(), updateUploadedFilesSaga(),
  ]);
}

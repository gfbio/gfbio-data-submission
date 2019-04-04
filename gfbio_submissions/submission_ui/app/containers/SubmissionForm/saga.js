import {
  all,
  call,
  cancelled,
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
  SUBMIT_FORM,
  SUBMIT_FORM_START,
  UPLOAD_FILES,
} from './constants';
import {
  makeSelectBrokerSubmissionId,
  makeSelectContributors,
  makeSelectDatasetLabels,
  makeSelectFileUploads,
  makeSelectFormWrapper,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
  makeSelectRelatedPublications, makeSelectRequestBrokerSubmissionId,
  makeSelectToken,
  makeSelectUserId,
} from './selectors';
import {
  fetchSubmissionError,
  fetchSubmissionSuccess,
  saveForm,
  saveFormError,
  saveFormSuccess,
  submitFormError,
  submitFormStart,
  submitFormSuccess,
  uploadFileError,
  uploadFileProgress,
  uploadFiles,
  uploadFilesSuccess,
  uploadFileSuccess,
} from './actions';
import {
  createUploadFileChannel,
  getSubmission,
  postSubmission,
} from './submissionApi';

// const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// TODO: move logic to utils.js. here only workflow
function* prepareRequestData(userId, submit = true) {
  const form = yield select(makeSelectFormWrapper());
  const formWrapper = form.formWrapper || {};
  let formValues = formWrapper.values || {};
  let legal_requirements = [];
  let categories = [];
  for (let f in formValues) {
    if (f.includes('legal-requirement')) {
      legal_requirements.push(f.replace('legal-requirement ', ''));
      delete formValues[f];
    }
    if (f.includes('data-category')) {
      categories.push(f.replace('data-category ', ''));
      delete formValues[f];
    }
  }
  const license = yield select(makeSelectLicense());
  const metadata_schema = yield select(makeSelectMetaDataSchema());
  const related_publications = yield select(makeSelectRelatedPublications());
  const datasetLabels = yield select(makeSelectDatasetLabels());
  const contributors = yield select(makeSelectContributors());
  const requirements = Object.assign({
    license,
    metadata_schema,
    legal_requirements,
    related_publications,
    datasetLabels,
    categories,
    contributors,
  }, formValues);
  return {
    target: 'GENERIC',
    release: submit, // false for save
    submitting_user: userId,
    // download_url: 'url?',
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
      // console.info('ERROR uploadProgressWatcher');
      // console.info(err);
      yield put(uploadFileError(index, err));
    } finally {
      // console.log('finally');
      yield put(uploadFileSuccess(index));
      if (yield cancelled()) {
        channel.close();
      }
    }
  }
}

function* uploadFile(file, index) {
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  const token = yield select(makeSelectToken());
  try {
    const uploadChannel = yield call(createUploadFileChannel, brokerSubmissionId, file.file, token);
    yield fork(uploadProgressWatcher, uploadChannel, index);
  } catch (err) {
    // console.log('yield error action uploadFile');
    // console.log(err);
    yield put(uploadFileError(index, err));
  }
}

function* performUploadSaga() {
  const fileUploads = yield select(makeSelectFileUploads());
  let index = 0;
  for (let f of fileUploads) {
    yield call(uploadFile, f, index);
    index++;
  }
  yield put(uploadFilesSuccess({}));
}

export function* performSubmitFormSaga() {
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  const payload = yield prepareRequestData(userId);
  try {
    const response = yield call(postSubmission, token, payload);
    yield put(submitFormSuccess(response));
  } catch (error) {
    // console.log(error);
    yield put(submitFormError(error));
  }
}

export function* performSaveFormSaga() {
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  const payload = yield prepareRequestData(userId, false);
  try {
    const response = yield call(postSubmission, token, payload);
    yield put(saveFormSuccess(response));
    yield put(uploadFiles());
  } catch (error) {
    yield put(saveFormError(error));
  }
}

export function* processSubmitFormTypeSaga() {
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  if (reduxFormForm.workflow === 'save') {
    yield put(saveForm());
  } else if (reduxFormForm.workflow === 'submit') {
    yield put(submitFormStart());
  }
}

export function* performFetchSubmissionSaga() {
  // console.log('performFetchSubmissionSaga');
  const token = yield select(makeSelectToken());
  const bsi = yield select(makeSelectRequestBrokerSubmissionId());
  try {
    const response = yield call(getSubmission, token, bsi);
    // console.log('success');
    // console.log(response);
    yield put(fetchSubmissionSuccess(response));
  } catch (error) {
    // console.log('error');
    // console.log(error);
    yield put(fetchSubmissionError(error));
  }
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

export function* uploadFilesSaga() {
  yield takeLatest(UPLOAD_FILES, performUploadSaga);
}

export function* fetchSubmissionSaga() {
  yield takeLatest(FETCH_SUBMISSION, performFetchSubmissionSaga);
}

export default function* rootSaga() {
  yield all([checkFormTypeSaga(), saveFormSaga(), submitFormSaga(), uploadFilesSaga(), fetchSubmissionSaga()]);
}

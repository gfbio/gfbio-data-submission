import {
  all,
  call, cancelled,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
  takeLeading,
  fork,
} from 'redux-saga/effects';
import {
  SAVE_FORM,
  SUBMIT_FORM,
  SUBMIT_FORM_START,
  UPLOAD_FILES,
  // UPLOAD_REQUEST,
} from './constants';
import {
  makeSelectBrokerSubmissionId,
  makeSelectDatasetLabels,
  makeSelectFileUploads,
  makeSelectFormWrapper,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
  makeSelectRelatedPublications,
  makeSelectToken,
  makeSelectUserId,
} from './selectors';
import {
  saveForm,
  saveFormError,
  saveFormSuccess,
  submitFormError,
  submitFormStart,
  submitFormSuccess, uploadFileProgress,
  // uploadFailure,
  uploadFiles, uploadFilesError,
  uploadFilesSuccess,
  // uploadProgress,
  // uploadSuccess,
} from './actions';
import {
  fileChannel,
  postFile,
  postSubmission,
  createUploadFileChannel,
} from './submissionApi';
import uuid from 'uuid';
import axios from 'axios';
import { eventChannel, END } from 'redux-saga';
import shortid from 'shortid';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

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
  const requirements = Object.assign({
    license,
    metadata_schema,
    legal_requirements,
    related_publications,
    datasetLabels,
    categories,
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

// function* uploadSaga(file) {
//   const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
//   const token = yield select(makeSelectToken());
//
//   const channel = yield call(fileChannel, token, brokerSubmissionId, file);
//   while (true) {
//     const { progress = 0, err, success } = yield take(channel);
//     if (err) {
//       yield put(uploadFilesError(err));
//       return;
//     }
//     if (success) {
//       yield put(uploadFilesSuccess(file));
//       return;
//     }
//     yield put(uploadFileProgress(file, progress));
//   }
// }


function countdown(secs) {
  return eventChannel(emitter => {
      const iv = setInterval(() => {
        secs -= 1;
        if (secs > 0) {
          emitter(secs);
        } else {
          // this causes the channel to close
          emitter(END);
        }
      }, 1000);
      // The subscriber must return an unsubscribe function
      return () => {
        clearInterval(iv);
      };
    },
  );
}

// function* uploadProgressWatcher(fileName, channel) {
function* uploadProgressWatcher(channel) {
  while (true) {
    try {
      const progress = yield take(channel);
      console.info('progress');
      console.info(progress);
      // yield put(actions.uploadFiles.progress(progress))
    } catch (err) {
      console.info('ERROR ');
      console.info(err);
      // yield put(actions.uploadFiles.progress(err))
    } finally {
      console.log('finally');
      if (yield cancelled()) channel.close();
    }
  }
}

//tmp.push({id: shortid.generate(), progress: 0, file: a})
// function* uploadFile(fileName, index, files) {
function* uploadFile(file) {
  console.warn('upload file');
  console.warn(file);
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  const token = yield select(makeSelectToken());
  try {
    // const formData = new FormData();
    // formData.append('files', files[fileName]);

    const uploadChannel = yield call(createUploadFileChannel, brokerSubmissionId, file.file, token);
    // yield fork(uploadProgressWatcher, fileName, uploadChannel);
    yield fork(uploadProgressWatcher, uploadChannel);
  } catch (err) {
    console.log('yield error action');
    console.log(err);
    // yield* actions.uploadFiles.failure(err);
  }
}

function* performUploadSaga() {
  const uid = uuid.v4();
  console.log('\nperformUploadSaga ' + uid);
  // console.log(file);
  // TODO: try blocking sequence
  const fileUploads = yield select(makeSelectFileUploads());
  console.log(fileUploads.toArray());
  const brokerSubmissionId = yield select(makeSelectBrokerSubmissionId());
  const token = yield select(makeSelectToken());
  const API_ROOT = 'http://0.0.0.0:8000';
  const SUBMISSIONS = '/api/submissions/';
  // iterate over all files scheduled for upload. call single upload each iteration
  // let tmp = fileUploads.map((index, value) => {return value});
  // let tmp = {};
  // for(let f of fileUploads) {
  //   tmp[f.id] = f;
  // }
  // console.log('TMP');
  //
  // console.log(tmp);

  // TODO: try to get this working. parallel ?
  // yield all(
  //   Object.keys(tmp).map(uploadFile)
  // )
  for (let f of fileUploads) {
    yield call(uploadFile, f);
  }
  //   console.log('\tupload single file');
  //   console.log(f);
  //   // let value = 12;
  //   // const chan = yield call(countdown, value);
  //
  //   // https://stackoverflow.com/questions/40402744/redux-saga-axios-and-progress-event
  //
  //   // let url = API_ROOT + SUBMISSIONS + brokerSubmissionId + '/upload/';
  //   const channel = yield call(createUploadFileChannel, brokerSubmissionId, f.file, token);
  //   while (true) {
  //     try {
  //       const progress = yield take(channel);
  //       console.info('progress');
  //       console.info(progress);
  //       // yield put(actions.uploadFiles.progress(progress))
  //     } catch (err) {
  //       console.info('ERROR ');
  //       console.info(err);
  //       // yield put(actions.uploadFiles.progress(err))
  //     } finally {
  //       console.log('finally');
  //       if (yield cancelled()) channel.close();
  //     }
  //   }
  //
  // }

  // success for upload of all files
  // yield put(uploadFilesSuccess({}));
}

export function* performSubmitFormSaga() {
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  const payload = yield prepareRequestData(userId);
  try {
    const response = yield call(postSubmission, token, payload);
    yield put(submitFormSuccess(response));
  } catch (error) {
    console.log(error);
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
    console.log('SAGA save succesful  | put form success');
    console.log('continue with file uploads ?');
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

export function* uploadFilesSaga() {
  yield takeLatest(UPLOAD_FILES, performUploadSaga);
}


// upload example


// // Upload the specified file
// export function* uploadFileSaga(file) {
//   const token = yield select(makeSelectToken());
//   const channel = yield call(
//     createUploadFileChannel,
//     'http://0.0.0.0:8000/api/submissions/5e6ef890-3973-40b4-a10b-2c3a783111f1/upload/',
//     file,
//     token);
//   while (true) {
//     const { progress = 0, err, success } = yield take(channel);
//     if (err) {
//       yield put(uploadFailure(file, err));
//       return;
//     }
//     if (success) {
//       yield put(uploadSuccess(file));
//       return;
//     }
//     yield put(uploadProgress(file, progress));
//   }
// }
//
// // Watch for an upload request and then
// // defer to another saga to perform the actual upload
// export function* uploadRequestWatcherSaga() {
//   yield takeEvery(UPLOAD_REQUEST, function* (action) {
//     const file = action.payload;
//     yield call(uploadFileSaga, file);
//   });
// }


export default function* rootSaga() {
  yield all([checkFormTypeSaga(), saveFormSaga(), submitFormSaga(), uploadFilesSaga()]);
}

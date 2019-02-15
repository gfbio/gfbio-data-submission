import {
  all,
  call,
  select,
  takeLatest,
  put,
  takeLeading,
} from 'redux-saga/effects';
import { SAVE_FORM, SUBMIT_FORM } from './constants';
import {
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
  makeSelectSubmitInProgress,
} from './selectors';
import {
  submitFormActive,
  submitFormError,
  submitFormSuccess,
} from './actions';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function* performSubmitFormSaga() {
  console.log('performSubmitFormSaga');
  // TODO: re-think approach to block multi submissions
  //    good news is TAKE_LATEST really only processes last click
  //    process starts over and over for every click until last one completes
  // const submitInProgress = yield select(makeSelectSubmitInProgress());
  // if (!submitInProgress) {
  //   yield put(submitFormActive());
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  console.log(reduxFormForm);
  const license = yield select(makeSelectLicense());
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  console.log(`${license} ${metaDataSchema}`);
  const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
  try {
    // const response = yield call(sendMethod, param1, param2);
    yield call(sleep, 3000);
    const response = '{}';
    console.log('sent data');
    console.log(data);
    yield put(submitFormSuccess(response));
  } catch (error) {
    console.log('Error');
    console.log(error);
    yield put(submitFormError(error));
  }
  // } else {
  //   console.log(`Submit in progress ${submitInProgress} do nothing`);
  // }
  console.log('------ END performSubmitFormSaga -----');
}

export function* performSaveFormSaga() {
  console.log('performSaveFormSaga');
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  console.log(reduxFormForm);
  // const license = yield select(makeSelectLicense());
  // const metaDataSchema = yield select(makeSelectMetaDataSchema());
  // console.log(`${license} ${metaDataSchema}`);
  // form state as it is, without submit needed
  // const formWrapper = yield select(makeSelectFormWrapper());
  // console.log(formWrapper);
  console.log('------ END performSaveFormSaga -----');
}

export function* processSubmitFormTypeSaga() {
  console.log('processSubmitFormType');
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  // console.log(reduxFormForm);
  if (reduxFormForm.workflow === 'save') {
    console.log('DO SAVE');
    yield* performSaveFormSaga();
  } else if (reduxFormForm.workflow === 'submit') {
    console.log('DO SUBMIT (else)');
    // TODO: better fork saga ?
    //  https://medium.freecodecamp.org/redux-saga-common-patterns-48437892e11c
    //  https://decembersoft.com/posts/4-tips-for-managing-many-sagas-in-a-react-redux-saga-app/
    //  https://mysticcoders.com/blog/simplifying-redux-saga-entry-file
    yield* performSubmitFormSaga();
  }
  console.log('------ END processSubmitFormType -----');
}

export function* submitFormSaga() {
  // new feature from rc1 that blocks until finished
  // https://redux-saga.js.org/docs/api/index.html#takeleadingpattern-saga-args
  yield takeLeading(SUBMIT_FORM, processSubmitFormTypeSaga);
}

export function* saveFormSaga() {
  yield takeLeading(SAVE_FORM, performSaveFormSaga);
}

export default function* rootSaga() {
  yield all([submitFormSaga(), saveFormSaga()]);
}

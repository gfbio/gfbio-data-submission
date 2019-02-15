import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import uuid from 'uuid';
import { SAVE_FORM, SUBMIT_FORM, SUBMIT_FORM_START } from './constants';
import {
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
} from './selectors';
import {
  saveForm,
  saveFormError,
  saveFormSuccess,
  submitFormError, submitFormStart,
  submitFormSuccess,
} from './actions';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function* performSubmitFormSaga() {
  const u4 = uuid.v4();
  console.log(`performSubmitFormSaga ${u4}`);
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  const license = yield select(makeSelectLicense());
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
  try {
    // const response = yield call(sendMethod, param1, param2);
    yield call(sleep, 3000);
    const response = '{}';
    yield put(submitFormSuccess(response));
  } catch (error) {
    yield put(submitFormError(error));
  }
  console.log(`------ END performSubmitFormSaga ----- ${u4}`);
}

export function* performSaveFormSaga() {
  console.log('performSaveFormSaga');
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  const license = yield select(makeSelectLicense());
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
  try {
    // const response = yield call(saveMethod, param1, param2);
    yield call(sleep, 3000);
    const response = '{}';
    yield put(saveFormSuccess(response));
  } catch (error) {
    yield put(saveFormError(error));
  }
  // form state as it is, without submit needed
  // const formWrapper = yield select(makeSelectFormWrapper());
  // console.log(formWrapper);
  console.log('------ END performSaveFormSaga -----');
}

export function* processSubmitFormTypeSaga() {
  const u4 = uuid.v4();
  console.log(`processSubmitFormType ${u4}`);
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  if (reduxFormForm.workflow === 'save') {
    yield put(saveForm());
  } else if (reduxFormForm.workflow === 'submit') {
    yield put(submitFormStart());
  }
  console.log(`------ END processSubmitFormType ----- ${u4}`);
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

export default function* rootSaga() {
  yield all([checkFormTypeSaga(), saveFormSaga(), submitFormSaga()]);
}

import { take, call, put, select, takeLatest, all } from 'redux-saga/effects';
import { SAVE_FORM, SUBMIT_FORM } from './constants';
import { makeSelectFormWrapper, makeSelectReduxFormForm } from './selectors';

export function* performSubmitFormSaga() {
  console.log('performSubmitFormSaga');
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  console.log(reduxFormForm);
  console.log('------ END performSubmitFormSaga -----');
}

export function* performSaveFormSaga() {
  console.log('performSaveFormSaga');
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  console.log(reduxFormForm);
  const formWrapper = yield select(makeSelectFormWrapper());
  console.log(formWrapper);
  console.log('------ END performSaveFormSaga -----');
}

export function* submitFormSaga() {
  yield takeLatest(SUBMIT_FORM, performSubmitFormSaga);
}

export function* saveFormSaga() {
  yield takeLatest(SAVE_FORM, performSaveFormSaga);
}

export default function* rootSaga() {
  yield all([saveFormSaga(), submitFormSaga()]);
}

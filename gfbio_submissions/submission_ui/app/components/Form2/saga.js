import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import { SUBMIT_FORM2 } from './constants';
import { submitForm2Success } from './actions';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
//
// export function* performSubmitFormSaga() {
//   const reduxFormForm = yield select(makeSelectReduxFormForm());
//   const license = yield select(makeSelectLicense());
//   const metaDataSchema = yield select(makeSelectMetaDataSchema());
//   const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
//   try {
//     console.log('SUBMIT ...');
//     console.log('sending: ');
//     console.log(data);
//     // const response = yield call(sendMethod, param1, param2);
//     yield call(sleep, 3000);
//     const response = '{}';
//     console.log('... DONE');
//     yield put(submitFormSuccess(response));
//   } catch (error) {
//     yield put(submitFormError(error));
//   }
// }

// export function* performSaveFormSaga() {
//   const reduxFormForm = yield select(makeSelectReduxFormForm());
//   const license = yield select(makeSelectLicense());
//   const metaDataSchema = yield select(makeSelectMetaDataSchema());
//   const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
//   try {
//     console.log('SAVE ...');
//     console.log('sending: ');
//     console.log(data);
//     // const response = yield call(saveMethod, param1, param2);
//     yield call(sleep, 3000);
//     const response = '{}';
//     console.log('... DONE');
//     yield put(saveFormSuccess(response));
//   } catch (error) {
//     yield put(saveFormError(error));
//   }
//   // form state as it is, without submit needed
//   // const formWrapper = yield select(makeSelectFormWrapper());
//   // console.log(formWrapper);
// }

export function* processSubmitForm2Saga() {
  console.log('processSubmitForm2Saga');
  yield call(sleep, 10000);
  yield put(submitForm2Success());
  // const reduxFormForm = yield select(makeSelectReduxFormForm());
  // if (reduxFormForm.workflow === 'save') {
  //   yield put(saveForm());
  // } else if (reduxFormForm.workflow === 'submit') {
  //   yield put(submitFormStart());
  // }
}

export function* checkForm2Saga() {
  console.log('checkForm2Saga');
  // new feature from rc1 that blocks until finished
  // https://redux-saga.js.org/docs/api/index.html#takeleadingpattern-saga-args
  yield takeLeading(SUBMIT_FORM2, processSubmitForm2Saga);
}

// export function* submitFormSaga() {
//   yield takeLeading(SUBMIT_FORM_START, performSubmitFormSaga);
// }
//
// export function* saveFormSaga() {
//   yield takeLeading(SAVE_FORM, performSaveFormSaga);
// }

export default function* rootSaga() {
  yield all([checkForm2Saga()]);
}

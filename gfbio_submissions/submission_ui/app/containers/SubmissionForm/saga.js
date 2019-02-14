import { take, call, put, select, takeLatest, all } from 'redux-saga/effects';
import { SAVE_FORM, SUBMIT_FORM } from './constants';
import {
  makeSelectFormWrapper,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
} from './selectors';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function* performSubmitFormSaga() {
  console.log('performSubmitFormSaga');
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  console.log(reduxFormForm);
  const license = yield select(makeSelectLicense());
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  console.log(`${license} ${metaDataSchema}`);
  const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
  try {
    // const response = yield call(sendMethod, param1, param2);
    const response = yield call(sleep, 3000);
    console.log('sent data');
    console.log(data);
  } catch (error) {
    console.log('Error');
    console.log(error);
  }
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
  yield takeLatest(SUBMIT_FORM, processSubmitFormTypeSaga);
}

export function* saveFormSaga() {
  yield takeLatest(SAVE_FORM, performSaveFormSaga);
}

export default function* rootSaga() {
  yield all([submitFormSaga(), saveFormSaga()]);
}

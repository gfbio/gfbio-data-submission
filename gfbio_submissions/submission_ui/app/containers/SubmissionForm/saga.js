import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import { SAVE_FORM, SUBMIT_FORM, SUBMIT_FORM_START } from './constants';
import {
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm, makeSelectToken, makeSelectUserId,
} from './selectors';
import {
  saveForm,
  saveFormError,
  saveFormSuccess,
  submitFormError,
  submitFormStart,
  submitFormSuccess,
} from './actions';
import { postSubmission } from './submissionApi';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export function* performSubmitFormSaga() {
  console.log('performSubmitFormSaga');

  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());

  console.log(token);
  console.log(window.props.token);

  const reduxFormForm = yield select(makeSelectReduxFormForm());
  const license = yield select(makeSelectLicense());
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
  try {
    console.log('SUBMIT ...');
    // console.log('sending: ');
    // console.log(data);
    // const response = yield call(sendMethod, param1, param2);
    // yield call(sleep, 3000);
    const response = yield call(postSubmission, token);
    console.log('SUBMIT ... response ');
    console.log(response);
    // console.log('... DONE');
    yield put(submitFormSuccess(response));
  } catch (error) {
    console.log('SUBMIT ...ERROR');
    console.log(error);
    yield put(submitFormError(error));
  }
}

export function* performSaveFormSaga() {
  const reduxFormForm = yield select(makeSelectReduxFormForm());
  const license = yield select(makeSelectLicense());
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  const data = Object.assign({ license, metaDataSchema }, reduxFormForm);
  try {
    console.log('SAVE ...');
    console.log('sending: ');
    console.log(data);
    // const response = yield call(saveMethod, param1, param2);
    yield call(sleep, 3000);
    const response = '{}';
    console.log('... DONE');
    yield put(saveFormSuccess(response));
  } catch (error) {
    yield put(saveFormError(error));
  }
  // form state as it is, without submit needed
  // const formWrapper = yield select(makeSelectFormWrapper());
  // console.log(formWrapper);
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
  console.log('checkFormTypeSaga');
  // new feature from rc1 that blocks until finished
  // https://redux-saga.js.org/docs/api/index.html#takeleadingpattern-saga-args
  yield takeLeading(SUBMIT_FORM, processSubmitFormTypeSaga);
}

export function* submitFormSaga() {
  console.log('checkForm2Saga');
  yield takeLeading(SUBMIT_FORM_START, performSubmitFormSaga);
}

export function* saveFormSaga() {
  console.log('saveFormSaga');
  yield takeLeading(SAVE_FORM, performSaveFormSaga);
}

export default function* rootSaga() {
  yield all([checkFormTypeSaga(), saveFormSaga(), submitFormSaga()]);
}

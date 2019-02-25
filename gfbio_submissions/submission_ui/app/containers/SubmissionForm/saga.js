import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import { SAVE_FORM, SUBMIT_FORM, SUBMIT_FORM_START } from './constants';
import {
  makeSelectFormWrapper,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm,
  makeSelectToken,
  makeSelectUserId,
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
  const metaDataSchema = yield select(makeSelectMetaDataSchema());
  const requirements = Object.assign({
    license,
    metaDataSchema,
    legal_requirements,
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

export function* performSubmitFormSaga() {
  console.log(' ----------------- performSubmitFormSaga -------------- ');
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
  console.log(' ----------------- performSaveFormSaga -------------- ');
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  const payload = yield prepareRequestData(userId, false);
  try {
    const response = yield call(postSubmission, token, payload);
    yield put(saveFormSuccess(response));
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

import { all, call, put, select, takeLeading } from 'redux-saga/effects';
import { SAVE_FORM, SUBMIT_FORM, SUBMIT_FORM_START } from './constants';
import {
  makeSelectFormWrapper,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectReduxFormForm, makeSelectRelatedPublications,
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
  const metadata_schema = yield select(makeSelectMetaDataSchema());
  const related_publications = yield select(makeSelectRelatedPublications());
  const requirements = Object.assign({
    license,
    metadata_schema,
    legal_requirements,
    related_publications,
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

export default function* rootSaga() {
  yield all([checkFormTypeSaga(), saveFormSaga(), submitFormSaga()]);
}

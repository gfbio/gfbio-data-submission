import {
  all,
  call,
  put,
  select,
  takeLatest,
  takeLeading,
} from 'redux-saga/effects';
import { FETCH_SUBMISSIONS } from './constants';
import { makeSelectToken, makeSelectUserId } from './selectors';
import {
  deleteSubmissionError,
  deleteSubmissionSuccess, fetchSubmissions,
  fetchSubmissionsError,
  fetchSubmissionsSuccess,
} from './actions';
import { getSubmissions } from './submissionListApi';
import { DELETE_SUBMISSION } from './constants';
import { makeSelectDeleteBrokerSubmissionId } from './selectors';
import { requestDeleteSubmission } from './submissionListApi';


// function* performChange() {
//   const location = yield select(makeSelectLocation());
//   console.log('PERFORM CHANGE ' + location);
//   console.log(location);
// }

function* performFetchSubmissionsSaga() {
  // console.log('performFetchsubmissionsSaga');
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  try {
    const response = yield call(getSubmissions, token, userId);
    // console.log('success');
    // console.log(response);
    yield put(fetchSubmissionsSuccess(response));
  } catch (error) {
    // console.log('error');
    // console.log(error);
    yield put(fetchSubmissionsError(error));
  }
}

export function* performDeleteSubmissionSaga() {
  console.log('performDeleteSubmissionSaga');
  const token = yield select(makeSelectToken());
  const deleteBrokerSubmissionId = yield select(makeSelectDeleteBrokerSubmissionId());
  try {
    const response = yield call(requestDeleteSubmission, token, deleteBrokerSubmissionId);
    yield put(deleteSubmissionSuccess(response));
    yield put(fetchSubmissions());
  } catch (error) {
    console.log('error');
    console.log(error);
    yield put(deleteSubmissionError(error));
  }
}


// export function* routeChange() {
//   yield takeEvery(LOCATION_CHANGE, performChange);
// }

export function* fetchSubmissionsSaga() {
  yield takeLatest(FETCH_SUBMISSIONS, performFetchSubmissionsSaga);
}

export function* deleteSubmissionSaga() {
  yield takeLeading(DELETE_SUBMISSION, performDeleteSubmissionSaga);
}

// Individual exports for testing
export default function* submissionListSaga() {
  yield all([fetchSubmissionsSaga(), deleteSubmissionSaga()]);
}

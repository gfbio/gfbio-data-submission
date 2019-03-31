import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { FETCH_SUBMISSIONS } from './constants';
import { makeSelectToken, makeSelectUserId } from '../SubmissionList/selectors';
import { fetchSubmissionsError, fetchSubmissionsSuccess } from './actions';
import { getSubmissions } from './submissionListApi';


// function* performChange() {
//   const location = yield select(makeSelectLocation());
//   console.log('PERFORM CHANGE ' + location);
//   console.log(location);
// }

function* performFetchSubmissionsSaga() {
  console.log('performFetchsubmissionsSaga');
  const token = yield select(makeSelectToken());
  const userId = yield select(makeSelectUserId());
  try {
    const response = yield call(getSubmissions, token, 33);
    console.log('success');
    console.log(response);
    yield put(fetchSubmissionsSuccess(response));
  } catch (error) {
    console.log('error');
    console.log(error);
    yield put(fetchSubmissionsError(error));
  }
}

// export function* routeChange() {
//   yield takeEvery(LOCATION_CHANGE, performChange);
// }

export function* fetchSubmissionsSaga() {
  yield takeLatest(FETCH_SUBMISSIONS, performFetchSubmissionsSaga);
}


// Individual exports for testing
export default function* submissionListSaga() {
  yield all([fetchSubmissionsSaga()]);
}

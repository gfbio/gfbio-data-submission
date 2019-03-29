import { all, takeLatest } from 'redux-saga/effects';
import { FETCH_SUBMISSIONS } from './constants';


// function* performChange() {
//   const location = yield select(makeSelectLocation());
//   console.log('PERFORM CHANGE ' + location);
//   console.log(location);
// }

function* performFetchSaga() {
  console.log('performFetchSaga');
}

// export function* routeChange() {
//   yield takeEvery(LOCATION_CHANGE, performChange);
// }

export function* fetchSubmissionsSaga() {
  yield takeLatest(FETCH_SUBMISSIONS, performFetchSaga);
}


// Individual exports for testing
export default function* submissionListSaga() {
  yield all([fetchSubmissionsSaga()]);
}

/*
 *
 * SubmissionList reducer
 *
 */

import { fromJS } from 'immutable';
import {
  FETCH_SUBMISSIONS,
  FETCH_SUBMISSIONS_ERROR,
  FETCH_SUBMISSIONS_SUCCESS,
} from './constants';

let backendParameters = {};
if (window.props !== undefined) {
  backendParameters = window.props;
}

export const initialState = fromJS({
  submissions: [],
  // TODO: replace. development default of 2
  // userId: backendParameters.userId || -1,
  userId: backendParameters.userId || 2,
  // token: backendParameters['token'] || 'NO_TOKEN',
  // FIXME: replace. during development token defaults to test-server user
  token: backendParameters['token'] || '5639b56bd077fb3e12d7e4a0ada244aaa970c2fd',
  userName: backendParameters.userName || '',

});

function submissionListReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_SUBMISSIONS:
      return state;
    case FETCH_SUBMISSIONS_SUCCESS:
      console.log('FETCH_SUBMISSIONS_SUCCESS');
      console.log(action.response);
      return state.
        set('submissions',action.response.data);
    case FETCH_SUBMISSIONS_ERROR:
      return state;
    default:
      return state;
  }
}

export default submissionListReducer;
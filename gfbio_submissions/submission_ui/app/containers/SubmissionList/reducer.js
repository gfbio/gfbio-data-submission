/*
 *
 * SubmissionList reducer
 *
 */

import { fromJS } from 'immutable';
import { FETCH_SUBMISSIONS } from './constants';

export const initialState = fromJS({
  submissions: [],
});

function submissionListReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_SUBMISSIONS:
      return state;
    default:
      return state;
  }
}

export default submissionListReducer;

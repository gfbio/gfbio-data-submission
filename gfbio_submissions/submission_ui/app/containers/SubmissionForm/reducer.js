/*
 *
 * SubmissionForm reducer
 *
 */

import { fromJS } from 'immutable';
import { DEFAULT_ACTION, SUBMIT_FORM } from './constants';

export const initialState = fromJS({});

function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    case SUBMIT_FORM:
      console.log('reducer SUBMIT_FORM');
      console.log(action.form);
      console.log('------------');
      return state;
    default:
      return state;
  }
}

export default submissionFormReducer;

/*
 *
 * SubmissionForm reducer
 *
 */

import { fromJS } from 'immutable';
import { DEFAULT_ACTION, SUBMIT_FORM } from './constants';

export const initialState = fromJS({
  license: 'CC BY 4.0',
});

function submissionFormReducer(state = initialState, action) {
  // console.log('submissionFormReducer ');
  // console.log(state);
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

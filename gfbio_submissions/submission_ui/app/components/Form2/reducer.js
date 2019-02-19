/*
 *
 * SubmissionForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  DEFAULT_ACTION,
  SUBMIT_FORM2,
  SUBMIT_FORM2_SUCCESS,
} from './constants';
import { call } from 'redux-saga';

export const initialState = fromJS({
  testForm2: {},
});

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    case SUBMIT_FORM2:
      console.log('SUBMIT_FORM2');
      console.log(action);
      return state;
    case SUBMIT_FORM2_SUCCESS:
      console.log('SUBMIT_FORM2_SUCCESS');
      console.log(action);
      return state;
    default:
      return state;
  }
}

export default submissionFormReducer;

/*
 *
 * SubmissionForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA,
  DEFAULT_ACTION,
  SAVE_FORM,
  SUBMIT_FORM,
  SUBMIT_FORM_ACTIVE,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_SUCCESS,
} from './constants';

export const initialState = fromJS({
  license: 'CC BY 4.0',
  metaDataSchema: 'None',
  reduxFormForm: {},
  submitInProgress: false,
});

function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    case CHANGE_LICENSE:
      console.log('reducer CHANGE_LICENSE');
      console.log(action.license);
      return state.set('license', action.license);
    case CHANGE_META_DATA_SCHEMA:
      console.log('reducer CHANGE_META_DATA_SCHEMA');
      console.log(action.metaDataSchema);
      return state.set('metaDataSchema', action.metaDataSchema);
    case SAVE_FORM:
      console.log('reducer SAVE_FORM');
      console.log('------------');
      return state;
    case SUBMIT_FORM:
      console.log('reducer SUBMIT_FORM');
      console.log(action.form);
      console.log('------------');
      // return state.set('reduxFormForm', action.form);
      return state
        .set('reduxFormForm', action.form)
        .set('submitInProgress', true);
    case SUBMIT_FORM_ACTIVE:
      console.log('reducer SUBMIT_FORM_ACTIVE');
      console.log('------------');
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_SUCCESS:
      console.log('reducer SUBMIT_FORM_SUCCESS');
      console.log(action.response);
      console.log('------------');
      return state.set('submitInProgress', false);
    case SUBMIT_FORM_ERROR:
      console.log('reducer SUBMIT_FORM_ERROR');
      console.log(action.errorResponse);
      console.log('------------');
    default:
      return state;
  }
}

export default submissionFormReducer;

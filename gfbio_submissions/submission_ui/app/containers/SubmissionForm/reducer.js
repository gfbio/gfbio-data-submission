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
  SAVE_FORM_ERROR,
  SAVE_FORM_SUCCESS,
  SET_EMBARGO_DATE,
  SUBMIT_FORM,
  SUBMIT_FORM_ACTIVE,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_START,
  SUBMIT_FORM_SUCCESS,
} from './constants';

export const initialState = fromJS({
  license: 'CC BY 4.0',
  metaDataSchema: 'None',
  reduxFormForm: {},
  initialValues: {},
  submitInProgress: false,
  saveInProgress: false,
  embargoDate: new Date(),
});

function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    case CHANGE_LICENSE:
      return state.set('license', action.license);
    case CHANGE_META_DATA_SCHEMA:
      return state.set('metaDataSchema', action.metaDataSchema);
    case SAVE_FORM:
      return state.set('saveInProgress', true);
    case SAVE_FORM_SUCCESS:
      // TODO: set bsi etc after success, from then its updates
      return state
        .set('initialValues', { firstName: 'BLUB', lastName: 'BLA' })
        .set('saveInProgress', false);
    case SAVE_FORM_ERROR:
      return state.set('saveInProgress', false);
    case SUBMIT_FORM:
      return state.set('reduxFormForm', action.form);
    case SUBMIT_FORM_START:
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_ACTIVE:
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_SUCCESS:
      return state.set('submitInProgress', false);
    case SUBMIT_FORM_ERROR:
      return state.set('submitInProgress', false);
    case SET_EMBARGO_DATE:
      return state.set('embargoDate', action.date);
    default:
      return state;
  }
}

export default submissionFormReducer;

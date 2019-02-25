/*
 *
 * SubmissionForm reducer
 *
 */
import uuid from 'uuid';
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

console.log('REDUCER');
let backendParameters = {};
console.log(window.props);
if (window.props !== undefined) {
  backendParameters = window.props;
  console.log('BACKEND PARAMS');
  console.log(backendParameters);
}

export const initialState = fromJS({
  license: 'CC BY 4.0',
  metaDataSchema: 'None',
  reduxFormForm: {},
  initialValues: {},
  // TODO: set token according to site. maybe IDM user in the future
  // token: '5639b56bd077fb3e12d7e4a0ada244aaa970c2fd',
  submitInProgress: false,
  saveInProgress: false,
  embargoDate: new Date(),
  // userId: backendParameters.userId || -1,
  // TODO: replace. development default of 2
  userId: backendParameters.userId || 2,
  // token: backendParameters['token'] || 'NO_TOKEN',
  // TODO: replace. during development token defaults to test-server user
  token: backendParameters['token'] || '5639b56bd077fb3e12d7e4a0ada244aaa970c2fd',
  userName: backendParameters.userName || '',

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
      const u = uuid.v4();
      return state
        .set('initialValues', { title: 'BLUB ' + u, description: 'BLA ' + u })
        .set('saveInProgress', false);
    case SAVE_FORM_ERROR:
      return state.set('saveInProgress', false);
    case SUBMIT_FORM:
      return state.set('reduxFormForm', action.form);
    case SUBMIT_FORM_START:
      console.log('reducer SUBMIT_FORM_START');
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_ACTIVE:
      console.log('reducer SUBMIT_FORM_ACTIVE');
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_SUCCESS:
      console.log('reducer SUBMIT_FORM_SUCCESS');
      return state.set('submitInProgress', false);
    case SUBMIT_FORM_ERROR:
      console.log('reducer SUBMIT_FORM_ERROR');
      return state.set('submitInProgress', false);
    case SET_EMBARGO_DATE:
      return state.set('embargoDate', action.date);
    default:
      return state;
  }
}

export default submissionFormReducer;

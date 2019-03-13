/*
 *
 * SubmissionForm reducer
 *
 */
import { fromJS } from 'immutable';
import {
  ADD_DATASET_LABEL,
  ADD_FILE_UPLOAD,
  ADD_RELATED_PUBLICATION,
  CHANGE_CURRENT_DATASET_LABEL,
  CHANGE_CURRENT_RELATED_PUBLICATION,
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA,
  DEFAULT_ACTION,
  REMOVE_DATASET_LABEL, REMOVE_FILE_UPLOAD,
  REMOVE_RELATED_PUBLICATION,
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

let backendParameters = {};
if (window.props !== undefined) {
  backendParameters = window.props;
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
  // TODO: decide what from actual response is needed, then put in reducer
  submitResponse: {},
  // TODO: same for save
  saveResponse: {},
  currentRelatedPublication: '',
  relatedPublications: Array(),
  currentLabel: '',
  datasetLabels: Array(),
  fileUploads: Array(),
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
      // const u = uuid.v4();
      return state
      // .set('initialValues', { title: 'BLUB ' + u, description: 'BLA ' + u })
        .set('saveResponse', action.response)
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
      return state
        .set('submitResponse', action.response)
        .set('submitInProgress', false);
    case SUBMIT_FORM_ERROR:
      return state.set('submitInProgress', false);
    case SET_EMBARGO_DATE:
      return state.set('embargoDate', action.date);
    case CHANGE_CURRENT_RELATED_PUBLICATION:
      return state
        .set('currentRelatedPublication', action.value);
    case ADD_RELATED_PUBLICATION:
      return state
        .update('relatedPublications', (relatedPublications) => relatedPublications.push(action.value))
        .set('currentRelatedPublication', '');
    case REMOVE_RELATED_PUBLICATION:
      return state
        .update('relatedPublications', (relatedPublications) => relatedPublications.splice(action.index, 1));
    case CHANGE_CURRENT_DATASET_LABEL:
      return state
        .set('currentLabel', action.value);
    case ADD_DATASET_LABEL:
      return state
        .update('datasetLabels', (datasetLabels) => datasetLabels.push(action.value))
        .set('currentLabel', '');
    case REMOVE_DATASET_LABEL:
      return state
        .update('datasetLabels', (datasetLabels) => datasetLabels.splice(action.index, 1));
    case ADD_FILE_UPLOAD:
      console.log('ADD_FILE_UPLOAD');
      console.log(action.value);
      return state
        .update('fileUploads', (fileUploads) => fileUploads.push(...action.value));
    case REMOVE_FILE_UPLOAD:
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1));
    default:
      return state;
  }
}

export default submissionFormReducer;

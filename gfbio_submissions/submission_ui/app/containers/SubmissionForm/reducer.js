/*
 *
 * SubmissionForm reducer
 *
 */
import { fromJS } from 'immutable';
import {
  ADD_CONTRIBUTOR,
  ADD_DATASET_LABEL,
  ADD_FILE_UPLOAD,
  ADD_RELATED_PUBLICATION,
  CHANGE_CURRENT_DATASET_LABEL,
  CHANGE_CURRENT_RELATED_PUBLICATION,
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA, CLOSE_SAVE_SUCCESS,
  FETCH_SUBMISSION,
  FETCH_SUBMISSION_ERROR,
  FETCH_SUBMISSION_SUCCESS,
  REMOVE_CONTRIBUTOR,
  REMOVE_DATASET_LABEL,
  REMOVE_FILE_UPLOAD,
  REMOVE_RELATED_PUBLICATION,
  SAVE_FORM,
  SAVE_FORM_ERROR,
  SAVE_FORM_SUCCESS,
  SET_CONTRIBUTORS,
  SET_EMBARGO_DATE,
  SUBMIT_FORM,
  SUBMIT_FORM_ACTIVE,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_START,
  SUBMIT_FORM_SUCCESS,
  UPDATE_CONTRIBUTOR,
  UPLOAD_FILE_ERROR,
  UPLOAD_FILE_PROGRESS,
  UPLOAD_FILE_SUCCESS,
  UPLOAD_FILES,
  UPLOAD_FILES_ERROR,
  UPLOAD_FILES_SUCCESS,
} from './constants';
import { setStateFormValues } from './utils';

let backendParameters = {};
if (window.props !== undefined) {
  backendParameters = window.props;
}

export const initialState = fromJS({
  license: 'CC BY 4.0',
  metaDataSchema: 'None',
  reduxFormForm: {},
  initialValues: {},
  submission: {},
  submitInProgress: false,
  saveInProgress: false,
  showSaveSuccess: false,
  embargoDate: new Date(),
  // userId: backendParameters.userId || -1,
  // TODO: replace. development default of 2
  userId: backendParameters.userId || 2,
  // token: backendParameters['token'] || 'NO_TOKEN',
  // FIXME: replace. during development token defaults to test-server user
  token: backendParameters['token'],
  userName: backendParameters.userName || '',
  // TODO: decide what from actual response is needed, then put in reducer
  submitResponse: {},
  // TODO: same for save
  saveResponse: {},
  currentRelatedPublication: '',
  relatedPublications: [],
  currentLabel: '',
  datasetLabels: [],
  fileUploads: [],
  fileUploadInProgress: false,
  brokerSubmissionId: '',
  requestBrokerSubmissionId: '',
  contributors: [],
  currentContributor: {},
});


function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_LICENSE:
      return state.set('license', action.license);
    case CHANGE_META_DATA_SCHEMA:
      return state.set('metaDataSchema', action.metaDataSchema);
    case SAVE_FORM:
      return state
        .set('showSaveSuccess', false)
        .set('saveInProgress', true);
    case SAVE_FORM_SUCCESS:
      // TODO: set bsi etc after success, from then its updates
      return state
        .set('brokerSubmissionId', action.response.data.broker_submission_id)
        .set('saveResponse', action.response)
        .set('saveInProgress', false)
        .set('showSaveSuccess', true);
    case CLOSE_SAVE_SUCCESS:
      return state
        .set('showSaveSuccess', false);
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
        .set('brokerSubmissionId', action.response.data.broker_submission_id)
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
      // console.log('ADD_DATASET_LABEL ');
      // console.log(action);
      // console.log(state.get('datasetLabels'));
      return state
        .update('datasetLabels', (datasetLabels) => datasetLabels.push(action.value))
        .set('currentLabel', '');
    case REMOVE_DATASET_LABEL:
      // console.log('REMOVE_DATASET_LABEL ');
      // console.log(action);
      return state
        .update('datasetLabels', (datasetLabels) => datasetLabels.splice(action.index, 1));
    case ADD_FILE_UPLOAD:
      return state
        .update('fileUploads', (fileUploads) => fileUploads.push(...action.value));
    case REMOVE_FILE_UPLOAD:
      if (state.get('fileUploadInProgress') == false) {
        return state
          .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1));
      } else {
        return state;
      }
    case UPLOAD_FILES:
      return state
        .set('fileUploadInProgress', true);
    case UPLOAD_FILES_SUCCESS:
      return state
        .set('fileUploadInProgress', false);
    case UPLOAD_FILES_ERROR:
      return state
        .set('fileUploadInProgress', false);
    case UPLOAD_FILE_PROGRESS:
      let upload = state.getIn(['fileUploads', action.index]);
      upload.progress = action.val;
      // TODO: setIn does not work as described in here: https://thomastuts.com/blog/immutable-js-101-maps-lists.html
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1, upload));
    case UPLOAD_FILE_ERROR:
      let error_upload = state.getIn(['fileUploads', action.index]);
      error_upload.messages = action.error;
      error_upload.status = 'error';
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1, error_upload));
    case UPLOAD_FILE_SUCCESS:
      let success_upload = state.getIn(['fileUploads', action.index]);
      success_upload.status = 'success';
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1, success_upload));
    case SET_CONTRIBUTORS:
      // console.log('SET_CONTRIBUTORS');
      // console.log(action.contributors);
      return state
        .set('contributors', action.contributors);
    case ADD_CONTRIBUTOR:
      // console.log('ADD_CONTRIBUTOR');
      // console.log(action.contributor);
      return state
        .update('contributors', (contributors) => contributors.push(action.contributor));
    case UPDATE_CONTRIBUTOR:
      // console.log('UPDATE_CONTRIBUTOR');
      // console.log(action.contributor);
      // console.log(action.index);
      return state
        .update('contributors', (contributors) => contributors.splice(action.index, 1, action.contributor));
    case REMOVE_CONTRIBUTOR:
      // console.log('REMOVE_CONTRIBUTOR');
      // console.log(action.index);
      return state
        .update('contributors', (contributors) => contributors.splice(action.index, 1));
    case FETCH_SUBMISSION:
      // console.log('FETCH_SUBMISSION');
      // TODO: set prop to inidcate loading -> loading gif
      return state.set('requestBrokerSubmissionId', action.brokerSubmissionId);
    case FETCH_SUBMISSION_SUCCESS:
      console.log('FETCH_SUBMISSION_SUCCESS');
      // TODO: 2x data: 1 from axios 1 from json-body
      // TODO: refactor to some sort of getter with checks
      console.log(action.response.data.broker_submission_id);
      // console.log(typeof action.response.data.data.requirements.contributors);
      return setStateFormValues(state, action);
    case FETCH_SUBMISSION_ERROR:
      // console.log('FETCH_SUBMISSION_ERROR');
      return state;
    default:
      return state;
  }
}

export default submissionFormReducer;

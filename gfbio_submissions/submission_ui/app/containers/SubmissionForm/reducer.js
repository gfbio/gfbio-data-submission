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
  ADD_RELATED_PUBLICATION, CHANGE_CONTRIBUTOR,
  CHANGE_CURRENT_DATASET_LABEL,
  CHANGE_CURRENT_RELATED_PUBLICATION,
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA,
  DEFAULT_ACTION,
  REMOVE_DATASET_LABEL,
  REMOVE_FILE_UPLOAD,
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
  UPLOAD_FILE_ERROR,
  UPLOAD_FILE_PROGRESS,
  UPLOAD_FILE_SUCCESS,
  UPLOAD_FILES,
  UPLOAD_FILES_ERROR,
  UPLOAD_FILES_SUCCESS,
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
  relatedPublications: [],
  currentLabel: '',
  datasetLabels: [],
  fileUploads: [],
  fileUploadInProgress: false,
  brokerSubmissionId: '',
  contributors: [],
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
      console.log('SAVE_FORM_SUCCESS');
      console.log(action.response);
      return state
        .set('brokerSubmissionId', action.response.data.broker_submission_id)
        .set('saveResponse', action.response)
        .set('saveInProgress', false);
    case SAVE_FORM_ERROR:
      console.log('SAVE_FORM_ERROR');
      console.log(action);
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
      return state
        .update('fileUploads', (fileUploads) => fileUploads.push(...action.value));
    case REMOVE_FILE_UPLOAD:
      console.log('REMOVE_FILE_UPLOAD');
      if (state.get('fileUploadInProgress') == false) {
        return state
          .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1));
      } else {
        return state;
      }
    case UPLOAD_FILES:
      console.log('UPLOAD_FILES reducer');
      return state
        .set('fileUploadInProgress', true);
    case UPLOAD_FILES_SUCCESS:
      console.log('UPLOAD_FILES_SUCCESS reducer');
      return state
        .set('fileUploadInProgress', false);
    case UPLOAD_FILES_ERROR:
      console.log('UPLOAD_FILES_ERROR reducer');
      return state
        .set('fileUploadInProgress', false);
    case UPLOAD_FILE_PROGRESS:
      console.log('\n\nUPLOAD_FILE_PROGRESS');
      let upload = state.getIn(['fileUploads', action.index]);
      upload.progress = action.val;
      console.log(upload);
      console.log('-----------------------------');
      // TODO: setIn does not work as described in here: https://thomastuts.com/blog/immutable-js-101-maps-lists.html
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1, upload));
    case UPLOAD_FILE_ERROR:
      console.log('UPLOAD_FILE_ERROR');
      console.log(action.index);
      console.log(action.error);
      let error_upload = state.getIn(['fileUploads', action.index]);
      error_upload.messages = action.error;
      error_upload.status = 'error';
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1, error_upload));
    case UPLOAD_FILE_SUCCESS:
      console.log('UPLOAD_FILE_SUCCESS');
      console.log(action.index);
      let success_upload = state.getIn(['fileUploads', action.index]);
      success_upload.status = 'success';
      return state
        .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1, success_upload));
    case ADD_CONTRIBUTOR:
      console.log('ADD_CONTRIBUTOR');
      console.log(action.contributor);
      return state
        .update('contributors', (contributors) => contributors.push(action.contributor));
    case CHANGE_CONTRIBUTOR:
      console.log('CHANGE_CONTRIBUTOR');
      console.log(action.index);
      return state;
    // return state
    //   .update('contributors', (contributors) => contributors.push(action.contributor));
    default:
      return state;
  }
}

export default submissionFormReducer;

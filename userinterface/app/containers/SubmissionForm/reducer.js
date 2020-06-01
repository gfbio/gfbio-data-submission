/*
 *
 * SubmissionForm reducer
 *
 */
import { fromJS, List } from 'immutable';
import {
  ADD_DATASET_LABEL,
  ADD_FILE_UPLOAD,
  ADD_RELATED_PUBLICATION,
  CHANGE_CURRENT_DATASET_LABEL,
  CHANGE_CURRENT_RELATED_PUBLICATION,
  CHANGE_LICENSE,
  CLOSE_EMBARGO_DIALOG,
  CLOSE_SAVE_SUCCESS,
  CLOSE_SUBMIT_SUCCESS,
  DELETE_FILE,
  DELETE_FILE_ERROR,
  DELETE_FILE_SUCCESS,
  DISMISS_SHOW_UPLOAD_LIMIT,
  FETCH_FILE_UPLOADS_ERROR,
  FETCH_FILE_UPLOADS_SUCCESS,
  FETCH_SUBMISSION,
  FETCH_SUBMISSION_ERROR,
  FETCH_SUBMISSION_SUCCESS,
  REMOVE_DATASET_LABEL,
  REMOVE_FILE_UPLOAD,
  REMOVE_RELATED_PUBLICATION,
  RESET_FORM,
  SAVE_FORM,
  SAVE_FORM_ERROR,
  SAVE_FORM_SUCCESS,
  SET_CONTRIBUTORS,
  SET_EMBARGO_DATE,
  SET_FORM_CHANGED,
  SET_METADATA_INDEX,
  SET_METADATA_ON_SERVER,
  SET_METADATA_ON_SERVER_ERROR,
  SHOW_EMBARGO_DIALOG,
  SHOW_UPLOAD_LIMIT,
  SUBMIT_FORM,
  SUBMIT_FORM_ACTIVE,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_START,
  SUBMIT_FORM_SUCCESS,
  UPDATE_SUBMISSION,
  UPDATE_SUBMISSION_ERROR,
  UPDATE_SUBMISSION_SUCCESS,
  UPDATE_SUBMISSION_SUCCESS_SUBMIT,
  UPLOAD_FILE_ERROR,
  UPLOAD_FILE_PROGRESS,
  UPLOAD_FILE_SUCCESS,
  UPLOAD_FILES,
  UPLOAD_FILES_ERROR,
  UPLOAD_FILES_SUCCESS,
  CLOSE_ERROR_MESSAGE,
} from './constants';
import {
  markMetaDataInScheduledUploads,
  markMetaDataInUploadsFromServer,
  resetStateFormValues,
  setStateFormValues,
} from './utils';

let backendParameters = {};
if (window.props !== undefined) {
  backendParameters = window.props;
}


function getInitialContributors(backendParameters) {
  return fromJS([]);
  let realName = backendParameters.userRealName || '';
  let nameSplit = realName.split(' ');
  let firstName, lastName = '';
  if (nameSplit.length > 1) {
    firstName = nameSplit.shift();
    lastName = nameSplit.join(' ');
  } else {
    firstName = nameSplit.shift();
  }
  const initialContributor = {
    firstName: firstName,
    lastName: lastName,
    emailAddress: backendParameters.userEmail || '',
  };
  if (initialContributor.firstName.length > 0 &&
    initialContributor.emailAddress.length) {
    return [initialContributor];
  }
  return [];
}

const initialContributors = getInitialContributors(backendParameters);

export const initialState = fromJS({
  license: 'CC BY 4.0',
  // metaDataSchema: 'None',
  reduxFormForm: {},
  initialValues: {},
  submission: {},
  submitInProgress: false,
  saveInProgress: false,
  showSubmitSuccess: false,
  showUpdateSuccess: false,

  showSaveSuccess: false,
  submitError: false,
  submissionErrors: [],

  embargoDate: new Date().setFullYear(new Date().getFullYear() + 1),
  formChanged: false,

  // TODO: replace. development default of 2
  // userId: backendParameters.userId || 1,
  userId: backendParameters.userId || -1,

  // TODO: replace. during development token defaults to test-server user
  // token: backendParameters['token'] || '1e61fdad931e3cdcaceb07d0134f578f5ff053a6',
  token: backendParameters['token'] || 'NO_TOKEN',
  userName: backendParameters.userName || '',

  // TODO: decide what from actual response is needed, then put in reducer
  submitResponse: {},
  // TODO: same for save
  saveResponse: {},
  currentRelatedPublication: '',
  relatedPublications: [],
  currentLabel: '',
  dataset_labels: [],

  fileUploads: [],
  fileUploadInProgress: false,

  fileUploadsFromServer: {},

  metaDataIndex: '',

  brokerSubmissionId: '',
  requestBrokerSubmissionId: '',
  contributors: initialContributors,
  currentContributor: {},
  updateWithRelease: false,
  promptOnLeave: true,

  showUploadLimitMessage: false,
  showEmbargoDialog: false,

  generalError: false,

});


function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case CHANGE_LICENSE:
      return state.set('license', action.license);
    // case CHANGE_META_DATA_SCHEMA:
    //   return state.set('metaDataSchema', action.metaDataSchema);
    case SAVE_FORM:
      return state
        // TODO: need showSaveSuccess later
        // .set('showSaveSuccess', false)
        // .set('promptOnLeave', false)
        .set('saveInProgress', true);
    case SAVE_FORM_SUCCESS:
      // TODO: set bsi etc after success, from then its updates
      return state
        .set('metaDataIndex', '')
        .set('brokerSubmissionId', action.response.data.broker_submission_id)
        .set('saveResponse', action.response)
        .set('saveInProgress', false);
    case CLOSE_SAVE_SUCCESS:
      return state;
    case CLOSE_ERROR_MESSAGE:
      return state
        .set('submitError', false)
        .set('submissionErrors', []);
    case CLOSE_SUBMIT_SUCCESS:
      return state
        .set('showUpdateSuccess', false)
        .set('showSubmitSuccess', false);
    case SAVE_FORM_ERROR:
      return state
        .set('metaDataIndex', '')
        .set('saveInProgress', false);
    case SUBMIT_FORM:
      return state
        .set('promptOnLeave', false)
        .set('formChanged', false)
        .set('reduxFormForm', action.form);
    case SUBMIT_FORM_START:
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_ACTIVE:
      return state.set('submitInProgress', true);
    case SUBMIT_FORM_SUCCESS:
      return state
        .set('metaDataIndex', '')
        .set('brokerSubmissionId', action.response.data.broker_submission_id)
        .set('submitResponse', action.response)
        .set('submitInProgress', false)
        .set('showSubmitSuccess', true);
    case SUBMIT_FORM_ERROR:
      return state
        .set('metaDataIndex', '')
        .set('submitInProgress', false)
        .set('submitError', true)
        .set(
          'submissionErrors',
          action.errorResponse?.response?.data?.data || [
            'Server error, please try again later.',
          ],
        );
    case SHOW_EMBARGO_DIALOG:
      return state
        .set('showEmbargoDialog', true);
    case CLOSE_EMBARGO_DIALOG:
      return state
        .set('showEmbargoDialog', false);
    case SET_EMBARGO_DATE:
      return state
        .set('embargoDate', action.date);
    case SET_FORM_CHANGED:
      return state.set('formChanged', action.changed);
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
        .update('dataset_labels', (dataset_labels) => dataset_labels.push(action.value))
        .set('currentLabel', '');
    case REMOVE_DATASET_LABEL:
      return state
        .update('dataset_labels', (dataset_labels) => dataset_labels.splice(action.index, 1));
    case SHOW_UPLOAD_LIMIT:
      return state
        .set('generalError', true)
        .set('showUploadLimitMessage', true);
    case DISMISS_SHOW_UPLOAD_LIMIT:
      return state
        .set('generalError', false)
        .set('showUploadLimitMessage', false);
    case ADD_FILE_UPLOAD:
      return state
        .set('showUploadLimitMessage', false)
        .update('fileUploads', (fileUploads) => fileUploads.push(...action.value));
    case REMOVE_FILE_UPLOAD:
      if (state.get('fileUploadInProgress') === false) {
        return state
          .set('metaDataIndex', '')
          .update('fileUploads', (fileUploads) => fileUploads.splice(action.index, 1));
      } else {
        return state;
      }
    case UPLOAD_FILES:
      return state
        .set('fileUploadInProgress', true);
    case UPLOAD_FILES_SUCCESS:
      return state
        .set('metaDataIndex', '')
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
    case DELETE_FILE:
      return state;
    case DELETE_FILE_SUCCESS:
      return state;
    case DELETE_FILE_ERROR:
      return state;
    case SET_CONTRIBUTORS:
      console.log('SAVING CONTRIBUTORS');
      return state.set('contributors', action.contributors);
    case FETCH_SUBMISSION:
      // TODO: set prop to inidcate loading -> loading gif
      return state.set('requestBrokerSubmissionId', action.brokerSubmissionId);
    case FETCH_SUBMISSION_SUCCESS:
      // TODO: 2x data: 1 from axios 1 from json-body
      // TODO: refactor to some sort of getter with checks
      return setStateFormValues(state, action).set('promptOnLeave', true)
        .set('showUpdateSuccess', false)
        .set('showSubmitSuccess', false);
    case FETCH_SUBMISSION_ERROR:
      return state;
    case FETCH_FILE_UPLOADS_SUCCESS:
      return state
        .set('fileUploads', List())
        .set('fileUploadsFromServer', action.response.data);
    case FETCH_FILE_UPLOADS_ERROR:
      return state;
    case RESET_FORM:
      state = resetStateFormValues(state, getInitialContributors(backendParameters));
      return state;
    case UPDATE_SUBMISSION:
      // TODO: set prop to inidcate loading -> loading gif
      // return state.set('requestBrokerSubmissionId', action.brokerSubmissionId);
      return state
        .set('updateWithRelease', action.release);
    case UPDATE_SUBMISSION_SUCCESS:
      // TODO: 2x data: 1 from axios 1 from json-body
      // TODO: refactor to some sort of getter with checks
      return state
        .set('saveInProgress', false)
        .set('submitInProgress', false)
        .set('metaDataIndex', '')
        .set('updateWithRelease', false);
    case UPDATE_SUBMISSION_SUCCESS_SUBMIT:
      // TODO: 2x data: 1 from axios 1 from json-body
      // TODO: refactor to some sort of getter with checks
      return state
        .set('saveInProgress', false)
        .set('submitInProgress', false)
        .set('showUpdateSuccess', true)
        // .set('showSaveSuccess', true)
        .set('metaDataIndex', '')
        .set('updateWithRelease', false);
    case UPDATE_SUBMISSION_ERROR:
      return state
        .set('updateWithRelease', action.release)
        .set('submitInProgress', false)
        .set('submitError', true)
        .set(
          'submissionErrors',
          action.errorResponse?.response?.data?.data || [
            'Server error, please try again later.',
          ],
        );
    case SET_METADATA_INDEX:
      let newMetaDataIndex = '';
      newMetaDataIndex = markMetaDataInScheduledUploads(state, action.metaDataIndex);
      return state
        // TODO: useless ?
        //   .set('metaDataFileName', '')
        .set('metaDataIndex', newMetaDataIndex);
    case SET_METADATA_ON_SERVER:
      let newMetaDataIndex_ = '';
      newMetaDataIndex_ = markMetaDataInUploadsFromServer(state, action.metaDataIndex);
      return state
        // TODO: useless ?
        //   .set('metaDataFileName', '')
        .set('metaDataIndex', newMetaDataIndex_);
    case SET_METADATA_ON_SERVER_ERROR:
      return state;
    default:
      return state;
  }
}

export default submissionFormReducer;

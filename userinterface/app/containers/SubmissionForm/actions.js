/*
 *
 * SubmissionForm actions
 *
 */

import {
  ADD_DATASET_LABEL,
  ADD_FILE_UPLOAD,
  ADD_RELATED_PUBLICATION,
  CHANGE_CURRENT_DATASET_LABEL,
  CHANGE_CURRENT_RELATED_PUBLICATION,
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA,
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
  POST_COMMENT_ERROR,
  POST_COMMENT_SUCCUESS,
  REMOVE_DATASET_LABEL,
  REMOVE_FILE_UPLOAD,
  REMOVE_RELATED_PUBLICATION,
  RESET_FORM,
  SAVE_FORM,
  SAVE_FORM_ERROR,
  SAVE_FORM_SUCCESS,
  SET_CONTRIBUTORS,
  SET_EMBARGO_DATE,
  SET_METADATA_INDEX,
  SET_METADATA_ON_SERVER,
  SET_METADATA_ON_SERVER_ERROR,
  SET_METADATA_ON_SERVER_SUCCESS,
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
  UPLOAD_FILES_SUCCESS,
  CLOSE_ERROR_MESSAGE,
  SET_FORM_CHANGED,
  SET_LOADING,
} from './constants';

export function changeLicense(license) {
  return {
    type: CHANGE_LICENSE,
    license,
  };
}

export function changeMetaDataSchema(metaDataSchema) {
  return {
    type: CHANGE_META_DATA_SCHEMA,
    metaDataSchema,
  };
}

export function saveForm() {
  return {
    type: SAVE_FORM,
  };
}

export function saveFormSuccess(response) {
  return {
    type: SAVE_FORM_SUCCESS,
    response,
  };
}

export function saveFormError(error) {
  return {
    type: SAVE_FORM_ERROR,
    error,
  };
}

export function submitForm(form) {
  return {
    type: SUBMIT_FORM,
    form,
  };
}

export function submitFormStart() {
  return {
    type: SUBMIT_FORM_START,
  };
}

export function submitFormActive() {
  return {
    type: SUBMIT_FORM_ACTIVE,
  };
}

export function submitFormSuccess(response) {
  return {
    type: SUBMIT_FORM_SUCCESS,
    response,
  };
}

export function submitFormError(errorResponse) {
  return {
    type: SUBMIT_FORM_ERROR,
    errorResponse,
  };
}

export function setEmbargoDate(date) {
  return {
    type: SET_EMBARGO_DATE,
    date,
  };
}

export function setFormChanged(changed) {
  return {
    type: SET_FORM_CHANGED,
    changed,
  };
}

export function addRelatedPublication(value) {
  return {
    type: ADD_RELATED_PUBLICATION,
    value,
  };
}

export function removeRelatedPublication(index) {
  return {
    type: REMOVE_RELATED_PUBLICATION,
    index,
  };
}

export function changeCurrentRelatedPublication(value) {
  return {
    type: CHANGE_CURRENT_RELATED_PUBLICATION,
    value,
  };
}

export function addDatasetLabel(value) {
  return {
    type: ADD_DATASET_LABEL,
    value,
  };
}

export function removeDatsetLabel(index) {
  return {
    type: REMOVE_DATASET_LABEL,
    index,
  };
}

export function changeCurrentLabel(value) {
  return {
    type: CHANGE_CURRENT_DATASET_LABEL,
    value,
  };
}

export function addFileUpload(value) {
  return {
    type: ADD_FILE_UPLOAD,
    value,
  };
}

export function removeFileUpload(index) {
  return {
    type: REMOVE_FILE_UPLOAD,
    index,
  };
}

// export function uploadFiles() {
//   return {
//     type: UPLOAD_FILES,
//   };
// }

/* Files with s for multiple */
export function uploadFilesSuccess(response) {
  return {
    type: UPLOAD_FILES_SUCCESS,
    response,
  };
}

// export function uploadFilesError(errorResponse) {
//   return {
//     type: UPLOAD_FILES_ERROR,
//     errorResponse,
//   };
// }

/* END Files with s for multiple */

/* File no s for single File */
export function uploadFileProgress(index, val) {
  return {
    type: UPLOAD_FILE_PROGRESS,
    index,
    val,
  };
}

export function uploadFileError(index, error) {
  return {
    type: UPLOAD_FILE_ERROR,
    index,
    error,
  };
}

export function uploadFileSuccess(index) {
  return {
    type: UPLOAD_FILE_SUCCESS,
    index,
  };
}

/* END File no s for single File */

export function setContributors(contributors) {
  return {
    type: SET_CONTRIBUTORS,
    contributors,
  };
}

export function fetchSubmission(brokerSubmissionId) {
  return {
    type: FETCH_SUBMISSION,
    brokerSubmissionId,
  };
}

export function fetchSubmissionSuccess(response) {
  return {
    type: FETCH_SUBMISSION_SUCCESS,
    response,
  };
}

export function fetchSubmissionError(errorResponse) {
  return {
    type: FETCH_SUBMISSION_ERROR,
    errorResponse,
  };
}

export function closeSubmitSuccess() {
  return {
    type: CLOSE_SUBMIT_SUCCESS,
  };
}

export function closeSaveSuccess() {
  return {
    type: CLOSE_SAVE_SUCCESS,
  };
}

export function closeSubmitError() {
  return {
    type: CLOSE_ERROR_MESSAGE,
  };
}

export function resetForm() {
  return {
    type: RESET_FORM,
  };
}

export function updateSubmission(release) {
  return {
    type: UPDATE_SUBMISSION,
    release,
  };
}


export function updateSubmissionSuccess(response) {
  return {
    type: UPDATE_SUBMISSION_SUCCESS,
    response,
  };
}

export function updateSubmissionSuccessSubmit(response) {
  return {
    type: UPDATE_SUBMISSION_SUCCESS_SUBMIT,
    response,
  };
}

export function updateSubmissionError(errorResponse) {
  return {
    type: UPDATE_SUBMISSION_ERROR,
    errorResponse,
  };
}

// TODO: remove changeScheduledUploads once second action is in place
export function setMetaDataIndex(metaDataIndex) {
  return {
    type: SET_METADATA_INDEX,
    metaDataIndex,
  };
}

export function setMetaDataOnServer(metaDataIndex, file) {
  return {
    type: SET_METADATA_ON_SERVER,
    metaDataIndex,
    file,
  };
}

export function setMetaDataOnServerSuccess(metaDataIndex) {
  return {
    type: SET_METADATA_ON_SERVER_SUCCESS,
    metaDataIndex,
  };
}

export function setMetaDataOnServerError(error) {
  return {
    type: SET_METADATA_ON_SERVER_ERROR,
    error,
  };
}


export function showUplaodLimit() {
  return {
    type: SHOW_UPLOAD_LIMIT,
  };
}


export function dismissShowUplaodLimit() {
  return {
    type: DISMISS_SHOW_UPLOAD_LIMIT,
  };
}

export function showEmbargoDialog() {
  return {
    type: SHOW_EMBARGO_DIALOG,
  };
}

export function closeEmbargoDialog() {
  return {
    type: CLOSE_EMBARGO_DIALOG,
  };
}


export function fetchFileUploadsSuccess(response) {
  return {
    type: FETCH_FILE_UPLOADS_SUCCESS,
    response,
  };
}

export function fetchFileUploadsError(error) {
  return {
    type: FETCH_FILE_UPLOADS_ERROR,
    error,
  };
}

export function deleteFile(fileKey) {
  return {
    type: DELETE_FILE,
    fileKey,
  };
}

export function deleteFileSuccess(response) {
  return {
    type: DELETE_FILE_SUCCESS,
    response,
  };
}

export function deleteFileError(error) {
  return {
    type: DELETE_FILE_ERROR,
    error,
  };
}

export function postCommentSuccess(response) {
  return {
    type: POST_COMMENT_SUCCUESS,
    response,
  };
}

export function postCommentError(error) {
  return {
    type: POST_COMMENT_ERROR,
    error,
  };
}

export function setLoading(value) {
  return {
    type: SET_LOADING,
    value,
  };
}

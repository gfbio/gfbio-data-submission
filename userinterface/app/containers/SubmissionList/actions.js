/*
 *
 * SubmissionList actions
 *
 */

import {
  CLOSE_DELETE_DIALOG,
  DELETE_SUBMISSION,
  DELETE_SUBMISSION_ERROR,
  DELETE_SUBMISSION_SUCCESS,
  FETCH_SUBMISSIONS,
  FETCH_SUBMISSIONS_ERROR,
  FETCH_SUBMISSIONS_SUCCESS, SHOW_DELETE_DIALOG,
} from './constants';

export function fetchSubmissions() {
  return {
    type: FETCH_SUBMISSIONS,
  };
}

export function fetchSubmissionsSuccess(response) {
  return {
    type: FETCH_SUBMISSIONS_SUCCESS,
    response,
  };
}

export function fetchSubmissionsError(errorResponse) {
  return {
    type: FETCH_SUBMISSIONS_ERROR,
    errorResponse,
  };
}


export function showDeleteSubmissionDialog(brokerSubmissionId) {
  return {
    type: SHOW_DELETE_DIALOG,
    brokerSubmissionId,
  };
}


export function closeDeleteSubmissionDialog() {
  return {
    type: CLOSE_DELETE_DIALOG,
  };
}

export function deleteSubmission() {
  return {
    type: DELETE_SUBMISSION,
  };
}


export function deleteSubmissionSuccess(response) {
  return {
    type: DELETE_SUBMISSION_SUCCESS,
    response,
  };
}

export function deleteSubmissionError(errorResponse) {
  return {
    type: DELETE_SUBMISSION_ERROR,
    errorResponse,
  };
}

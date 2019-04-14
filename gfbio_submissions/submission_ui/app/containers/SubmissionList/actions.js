/*
 *
 * SubmissionList actions
 *
 */

import {
  DELETE_SUBMISSION, DELETE_SUBMISSION_ERROR, DELETE_SUBMISSION_SUCCESS,
  FETCH_SUBMISSIONS,
  FETCH_SUBMISSIONS_ERROR,
  FETCH_SUBMISSIONS_SUCCESS,
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

export function deleteSubmission(brokerSubmissionId) {
  return {
    type: DELETE_SUBMISSION,
    brokerSubmissionId,
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

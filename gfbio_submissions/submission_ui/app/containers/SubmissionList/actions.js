/*
 *
 * SubmissionList actions
 *
 */

import {
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

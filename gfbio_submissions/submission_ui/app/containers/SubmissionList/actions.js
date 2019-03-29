/*
 *
 * SubmissionList actions
 *
 */

import { FETCH_SUBMISSIONS } from './constants';

export function fetchSubmissions() {
  return {
    type: FETCH_SUBMISSIONS,
  };
}

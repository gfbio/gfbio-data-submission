/*
 *
 * SubmissionForm actions
 *
 */

import { DEFAULT_ACTION, SUBMIT_FORM } from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function submitForm(form) {
  return {
    type: SUBMIT_FORM,
    form,
  };
}

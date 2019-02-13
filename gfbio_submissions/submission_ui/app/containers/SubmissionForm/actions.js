/*
 *
 * SubmissionForm actions
 *
 */

import { CHANGE_LICENSE, DEFAULT_ACTION, SUBMIT_FORM } from './constants';

export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function changeLicense(license) {
  return {
    type: CHANGE_LICENSE,
    license,
  };
}

export function submitForm(form) {
  return {
    type: SUBMIT_FORM,
    form,
  };
}

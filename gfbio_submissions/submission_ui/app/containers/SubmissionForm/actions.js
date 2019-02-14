/*
 *
 * SubmissionForm actions
 *
 */

import {
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA,
  DEFAULT_ACTION,
  SAVE_FORM,
  SUBMIT_FORM,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_SUCCESS,
} from './constants';

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

export function submitForm(form) {
  return {
    type: SUBMIT_FORM,
    form,
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

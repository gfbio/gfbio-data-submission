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
  SAVE_FORM_ERROR,
  SAVE_FORM_SUCCESS, SET_EMBARGO_DATE,
  SUBMIT_FORM,
  SUBMIT_FORM_ACTIVE,
  SUBMIT_FORM_ERROR,
  SUBMIT_FORM_START,
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

export function saveFormSuccess(response) {
  return {
    type: SAVE_FORM_SUCCESS,
    response,
  };
}

export function saveFormError() {
  return {
    type: SAVE_FORM_ERROR,
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

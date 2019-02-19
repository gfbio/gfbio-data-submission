import {
  DEFAULT_ACTION,
  SUBMIT_FORM2,
  SUBMIT_FORM2_SUCCESS,
} from './constants';


export function defaultAction() {
  return {
    type: DEFAULT_ACTION,
  };
}

export function submitForm2(form) {
  console.log('submitForm2');
  return {
    type: SUBMIT_FORM2,
    form,
  };
}

export function submitForm2Success(response) {
  console.log('submitForm2Success');
  return {
    type: SUBMIT_FORM2_SUCCESS,
    response,
  };
}



/*
 *
 * SubmissionForm reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CHANGE_LICENSE,
  CHANGE_META_DATA_SCHEMA,
  DEFAULT_ACTION,
  SUBMIT_FORM,
} from './constants';

export const initialState = fromJS({
  license: 'CC BY 4.0',
  metaDataSchema: 'None',
});

function submissionFormReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    case CHANGE_LICENSE:
      console.log('reducer CHANGE_LICENSE');
      console.log(action.license);
      return state.set('license', action.license);
    case CHANGE_META_DATA_SCHEMA:
      console.log('reducer CHANGE_META_DATA_SCHEMA');
      console.log(action.metaDataSchema);
      return state.set('metaDataSchema', action.metaDataSchema);
    case SUBMIT_FORM:
      console.log('reducer SUBMIT_FORM');
      console.log(action.form);
      console.log('------------');
      return state;
    default:
      return state;
  }
}

export default submissionFormReducer;

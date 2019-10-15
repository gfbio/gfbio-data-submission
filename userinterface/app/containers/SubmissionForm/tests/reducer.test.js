import { fromJS } from 'immutable';
import submissionFormReducer from '../reducer';

describe('submissionFormReducer', () => {
  it('returns the initial state', () => {
    expect(submissionFormReducer(undefined, {})).toEqual(fromJS({}));
  });
});

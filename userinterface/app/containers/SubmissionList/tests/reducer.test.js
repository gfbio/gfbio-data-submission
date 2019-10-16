import { fromJS } from 'immutable';
import submissionListReducer from '../reducer';

describe('submissionListReducer', () => {
  it('returns the initial state', () => {
    expect(submissionListReducer(undefined, {})).toEqual(fromJS({}));
  });
});

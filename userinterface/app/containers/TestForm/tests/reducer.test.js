import { fromJS } from 'immutable';
import testFormReducer from '../reducer';

describe('testFormReducer', () => {
  it('returns the initial state', () => {
    expect(testFormReducer(undefined, {})).toEqual(fromJS({}));
  });
});

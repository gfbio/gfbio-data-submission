import { fromJS } from 'immutable';
import test_1Reducer from '../reducer';

describe('test_1Reducer', () => {
  it('returns the initial state', () => {
    expect(test_1Reducer(undefined, {})).toEqual(fromJS({}));
  });
});

import { fromJS } from 'immutable';
import form3Reducer from '../reducer';

describe('form3Reducer', () => {
  it('returns the initial state', () => {
    expect(form3Reducer(undefined, {})).toEqual(fromJS({}));
  });
});

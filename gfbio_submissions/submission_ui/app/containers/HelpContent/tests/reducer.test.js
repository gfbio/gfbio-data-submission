import { fromJS } from 'immutable';
import helpContentReducer from '../reducer';

describe('helpContentReducer', () => {
  it('returns the initial state', () => {
    expect(helpContentReducer(undefined, {})).toEqual(fromJS({}));
  });
});

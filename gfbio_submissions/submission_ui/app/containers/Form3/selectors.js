import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the form3 state domain
 */

const selectForm3Domain = state => state.get('form3', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by Form3
 */

const makeSelectForm3 = () =>
  createSelector(selectForm3Domain, substate => substate.toJS());

export default makeSelectForm3;
export { selectForm3Domain };

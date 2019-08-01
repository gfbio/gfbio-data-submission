import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the testForm state domain
 */

const selectTestFormDomain = state => state.get('testForm', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by TestForm
 */

const makeSelectTestForm = () =>
  createSelector(selectTestFormDomain, substate => substate.toJS());

export default makeSelectTestForm;
export { selectTestFormDomain };

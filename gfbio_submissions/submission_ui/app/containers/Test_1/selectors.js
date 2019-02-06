import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the test_1 state domain
 */

const selectTest_1Domain = state => state.get('test_1', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by Test_1
 */

const makeSelectTest_1 = () =>
  createSelector(selectTest_1Domain, substate => substate.toJS());

export default makeSelectTest_1;
export { selectTest_1Domain };

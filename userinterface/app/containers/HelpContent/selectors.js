import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the helpContent state domain
 */

const selectHelpContentDomain = state => state.get('helpContent', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by HelpContent
 */

const makeSelectHelpContent = () =>
  createSelector(selectHelpContentDomain, substate => substate.toJS());

export default makeSelectHelpContent;
export { selectHelpContentDomain };

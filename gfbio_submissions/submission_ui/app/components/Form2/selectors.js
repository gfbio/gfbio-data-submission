import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the submissionForm state domain
 */

const selectSubmissionForm2Domain = state =>
  state.get('submissionForm2', initialState);

/**
 * Other specific selectors
 */


/**
 * Default selector used by SubmissionForm
 */

const makeSelectSubmissionForm2 = () =>
  createSelector(selectSubmissionForm2Domain, substate => substate.toJS());

const makeSelectTestForm2 = () =>
  createSelector(selectSubmissionForm2Domain, substate =>
    substate.get('testForm2'),
  );

export default makeSelectSubmissionForm2;

export {
  makeSelectTestForm2,
};

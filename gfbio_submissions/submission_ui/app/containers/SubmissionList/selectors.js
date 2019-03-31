import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the submissionList state domain
 */

const selectSubmissionListDomain = state =>
  state.get('submissionList', initialState);

/**
 * Other specific selectors
 */

/**
 * Default selector used by SubmissionList
 */

const makeSelectSubmissionList = () =>
  createSelector(selectSubmissionListDomain, substate => substate.toJS());

const makeSelectSubmissions = () =>
  createSelector(selectSubmissionListDomain, substate =>
    substate.get('submissions'),
  );

const makeSelectToken = () =>
  createSelector(selectSubmissionListDomain, substate =>
    substate.get('token'),
  );

const makeSelectUserId = () =>
  createSelector(selectSubmissionListDomain, substate =>
    substate.get('userId'),
  );


export default makeSelectSubmissionList;
export {
  selectSubmissionListDomain,
  makeSelectSubmissions,
  makeSelectToken,
  makeSelectUserId,
};

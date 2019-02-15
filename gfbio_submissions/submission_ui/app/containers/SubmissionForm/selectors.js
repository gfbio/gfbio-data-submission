import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the submissionForm state domain
 */

const selectSubmissionFormDomain = state =>
  state.get('submissionForm', initialState);

/**
 * Other specific selectors
 */
const selectReduxFormDomain = state => state.get('form', initialState);

/**
 * redux-form returns regular state. not ImmutableJS state ...
 */
const makeSelectFormWrapper = () =>
  createSelector(selectReduxFormDomain, substate => substate.formWrapper);

/**
 * Default selector used by SubmissionForm
 */

const makeSelectSubmissionForm = () =>
  createSelector(selectSubmissionFormDomain, substate => substate.toJS());

const makeSelectLicense = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('license'),
  );

const makeSelectMetaDataSchema = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('metaDataSchema'),
  );

const makeSelectReduxFormForm = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('reduxFormForm'),
  );

const makeSelectSubmitInProgress = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('submitInProgress'),
  );

const makeSelectSaveInProgress = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('saveInProgress'),
  );

const makeSelectEmbargoDate = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('embargoDate'),
  );

export default makeSelectSubmissionForm;

export {
  selectSubmissionFormDomain,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectFormWrapper,
  makeSelectReduxFormForm,
  makeSelectSubmitInProgress,
  makeSelectSaveInProgress,
  makeSelectEmbargoDate,
};

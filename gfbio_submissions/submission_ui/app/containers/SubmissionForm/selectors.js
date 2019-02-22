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
const selectReduxFormDomain = state => state.get('form');

// const selectRouter = state => state.get('router');

// const makeSelectLocation = () =>
//   createSelector(selectReduxFormDomain, substate =>
//     routerState.get('location').toJS(),
//   );

// console.log('selectors js');
// console.log(state);
// console.log('----------------');
/**
 * redux-form returns regular state. not ImmutableJS state ...
 */
const makeSelectFormWrapper = () =>
  createSelector(selectReduxFormDomain, substate => substate.toJS());

const makeSelectContactForm = () =>
  createSelector(selectReduxFormDomain, substate => substate.get('contact'));

const makeSelectFormWrapperErrors = () =>
  createSelector(selectReduxFormDomain, substate => substate.formWrapper.syncErrors);

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

const makeSelectInitialValue = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('initialValues'),
  );

const makeSelectToken = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('token'),
  );

const makeSelectUserId = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('userId'),
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
  makeSelectFormWrapperErrors,
  makeSelectInitialValue,
  makeSelectContactForm,
  makeSelectToken,
  makeSelectUserId,
};

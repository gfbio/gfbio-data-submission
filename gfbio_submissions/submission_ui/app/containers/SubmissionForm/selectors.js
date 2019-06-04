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

/**
 * redux-form returns regular state. not ImmutableJS state ...
 */
const makeSelectFormWrapper = () =>
  createSelector(selectReduxFormDomain, substate => substate.toJS());

const makeSelectContactForm = () =>
  createSelector(selectReduxFormDomain, substate => substate.get('contact'));

// const makeSelectFormWrapperErrors = () =>
//   createSelector(selectReduxFormDomain, substate => substate.formWrapper.syncErrors);

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

const makeSelectInitialValues = () =>
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

const makeSelectRelatedPublications = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('relatedPublications'),
  );

const makeSelectCurrentRelatedPublication = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('currentRelatedPublication'),
  );

const makeSelectDatasetLabels = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('dataset_labels'),
  );

const makeSelectCurrentLabel = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('currentLabel'),
  );

const makeSelectFileUploads = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('fileUploads'),
  );

const makeSelectFileUploadsFromServer = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('fileUploadsFromServer'),
  );

const makeSelectBrokerSubmissionId = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('brokerSubmissionId'),
  );

const makeSelectContributors = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('contributors'),
  );

const makeSelectSubmission = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('submission'),
  );

const makeSelectRequestBrokerSubmissionId = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('requestBrokerSubmissionId'),
  );

const makeSelectShowSubmitSuccess = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('showSubmitSuccess'),
  );

const makeSelectShowSaveSuccess = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('showSaveSuccess'),
  );


const makeSelectUpdateWithRelease = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('updateWithRelease'),
  );

const makeSelectMetaDataIndex = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('metaDataIndex'),
  );

// const makeSelectUploadListIndex = () =>
//   createSelector(selectSubmissionFormDomain, substate =>
//     substate.get('uploadListIndex'),
//   );

const makeSelectPromptOnLeave = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('promptOnLeave'),
  );

const makeSelectShowUploadLimitMessage = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('showUploadLimitMessage'),
  );

const makeSelectShowEmbargoDialog = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('showEmbargoDialog'),
  );

const makeSelectGeneralError = () =>
  createSelector(selectSubmissionFormDomain, substate =>
    substate.get('generalError'),
  );


// const makeSelectDeleteBrokerSubmissionId = () =>
//   createSelector(selectSubmissionFormDomain, substate =>
//     substate.get('deleteBrokerSubmissionId'),
//   );

export default makeSelectSubmissionForm;

export {
  selectSubmissionFormDomain,
  makeSelectLicense,
  makeSelectMetaDataSchema,
  makeSelectFormWrapper,
  makeSelectReduxFormForm,
  makeSelectSubmitInProgress,
  makeSelectShowSaveSuccess,
  makeSelectSaveInProgress,
  makeSelectEmbargoDate,
  makeSelectContactForm,
  makeSelectToken,
  makeSelectUserId,
  makeSelectRelatedPublications,
  makeSelectCurrentRelatedPublication,
  makeSelectCurrentLabel,
  makeSelectDatasetLabels,
  makeSelectFileUploads,
  makeSelectBrokerSubmissionId,
  makeSelectContributors,
  makeSelectInitialValues,
  makeSelectSubmission,
  makeSelectRequestBrokerSubmissionId,
  makeSelectShowSubmitSuccess,
  makeSelectUpdateWithRelease,
  makeSelectMetaDataIndex,
  // makeSelectDeleteBrokerSubmissionId,
  makeSelectPromptOnLeave,
  makeSelectShowUploadLimitMessage,
  makeSelectShowEmbargoDialog,
  makeSelectGeneralError,
  makeSelectFileUploadsFromServer,
  // makeSelectUploadListIndex,
};

import { DATA_CATEGORY_PREFIX, LEGAL_REQUIREMENTS_PREFIX } from './constants';
import { fromJS } from 'immutable';

export const prepareCategories = (requirements) => {
  let prepared_categories = {};
  if (requirements.categories !== undefined) {
    for (let c of requirements.categories) {
      prepared_categories[DATA_CATEGORY_PREFIX + c] = true;
    }
  }
  return prepared_categories;
};

export const prepareLegalRequirements = (requirements) => {
  let prepared_requirements = {};
  if (requirements.legal_requirements !== undefined) {
    for (let l of requirements.legal_requirements) {
      prepared_requirements[LEGAL_REQUIREMENTS_PREFIX + l] = true;
    }
  }
  return prepared_requirements;
};

export const prepareForMatchingKeys = (requirements, matchingKeys) => {
  let prepared = {};
  for (let m of matchingKeys) {
    if (requirements[m] !== undefined) {
      prepared[m] = requirements[m];
    }
  }
  return prepared;
};

export const prepareInitialValues = (submissionData) => {
  let initialValues = {};
  const directMatchingKeys = ['title', 'description', 'download_url', 'comment', 'data_center'];
  if (submissionData.data !== undefined && submissionData.data.requirements != undefined) {
    const requirements = submissionData.data.requirements;

    Object.assign(initialValues, prepareCategories(requirements));
    Object.assign(initialValues, prepareLegalRequirements(requirements));

    Object.assign(initialValues, prepareForMatchingKeys(requirements, directMatchingKeys));

  }
  return initialValues;
};

// TODO: .set('metaDataIndex', '')
export const setStateFormValues = (state, action) => {
  return state
    .set('brokerSubmissionId', action.response.data.broker_submission_id)
    .set('accessionId', action.response.data.accession_id)
    .set('initialValues', prepareInitialValues(action.response.data))
    .set('relatedPublications', fromJS(action.response.data.data.requirements.related_publications))
    .set('dataset_labels', fromJS(action.response.data.data.requirements.dataset_labels))
    .set('contributors', fromJS(action.response.data.data.requirements.contributors))
    .set('embargoDate', new Date(action.response.data.embargo))
    .set('license', action.response.data.data.requirements.license)
    // .set('metaDataSchema', action.response.data.data.requirements.metadata_schema)
    // .set('metaDataFileName', action.response.data.data.requirements.metadata_file_name)
    // TODO: need whole submission ?
    .set('submission', action.response.data);
};

export const resetStateFormValues = (state, initialContributors = []) => {
  return state
    // .set('showSubmitSuccess', false)
    .set('metaDataIndex', '')
    // .set('metaDataFileName', '')
    .set('brokerSubmissionId', '')
    .set('accessionId', [])
    .set('initialValues', {})
    .set('relatedPublications', fromJS([]))
    .set('dataset_labels', fromJS([]))
    .set('contributors', fromJS(initialContributors))
    .set('embargoDate', new Date().setFullYear(new Date().getFullYear() + 1))
    .set('license', 'CC BY 4.0')
    // .set('metaDataSchema', 'None')
    .set('fileUploads', fromJS([]))
    .set('fileUploadsFromServer', fromJS({}))
    // TODO: need whole submission ?
    .set('submission', {});
};

function removeMetaDataFlag(state, listName = '', fieldName = 'none') {
  let i = 0;
  for (let f of state.get(listName)) {
    if (f[fieldName] !== undefined) {
      f[fieldName] = false;
    }
    state.update(listName, (uploads) => uploads.splice(i, 1, f));
    i++;
  }
}

function setMetaDataFlag(state, listName = '', indexName, fieldName = 'none') {
  const metaDataIndex = parseInt(indexName.replace('uploaded_', ''));
  let i = 0;
  for (let f of state.get(listName)) {
    if (i === metaDataIndex && f[fieldName] === false) {
      f[fieldName] = true;
    } else {
      f[fieldName] = false;
    }
    state.update(listName, (uploads) => uploads.splice(i, 1, f));
    i++;
  }
  let newMetaDataIndex = indexName;
  if (
    state.getIn([listName, metaDataIndex]) !== undefined &&
    state.getIn([listName, metaDataIndex])[fieldName] === false) {
    newMetaDataIndex = '';
  } else if (
    state.get('fileUploadsFromServer')[metaDataIndex] !== undefined &&
    state.get('fileUploadsFromServer')[metaDataIndex][fieldName] === false
  ) {
    newMetaDataIndex = '';
  }
  return newMetaDataIndex;
}

export const markMetaDataInScheduledUploads = (state, metaDataIndex) => {
  removeMetaDataFlag(state, 'fileUploadsFromServer', 'meta_data');
  return setMetaDataFlag(state, 'fileUploads', metaDataIndex, 'metaData');
};

export const markMetaDataInUploadsFromServer = (state, metaDataIndex) => {
  removeMetaDataFlag(state, 'fileUploads', 'metaData');
  return setMetaDataFlag(state, 'fileUploadsFromServer', metaDataIndex, 'meta_data');
};

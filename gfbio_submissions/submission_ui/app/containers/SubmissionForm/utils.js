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
    // console.log(m);
    if (requirements[m] !== undefined) {
      prepared[m] = requirements[m];
    }
  }
  return prepared;
};

export const prepareInitialValues = (submissionData) => {
  // console.log('prepareInitialValues submissionData');
  // console.log(submissionData);
  let initialValues = {};
  const directMatchingKeys = ['title', 'description', 'dataUrl', 'comment', 'data_center'];
  if (submissionData.data !== undefined && submissionData.data.requirements != undefined) {
    const requirements = submissionData.data.requirements;

    Object.assign(initialValues, prepareCategories(requirements));
    Object.assign(initialValues, prepareLegalRequirements(requirements));

    Object.assign(initialValues, prepareForMatchingKeys(requirements, directMatchingKeys));

  }
  return initialValues;
};

export const setStateFormValues = (state, action) => {
  return state
    .set('initialValues', prepareInitialValues(action.response.data))
    .set('relatedPublications', fromJS(action.response.data.data.requirements.related_publications))
    .set('datasetLabels', fromJS(action.response.data.data.requirements.datasetLabels))
    .set('contributors', action.response.data.data.requirements.contributors)
    .set('embargoDate', new Date(action.response.data.embargo))
    .set('license', action.response.data.data.requirements.license)
    .set('metaDataSchema', action.response.data.data.requirements.metadata_schema)
    .set('submission', action.response.data);
};

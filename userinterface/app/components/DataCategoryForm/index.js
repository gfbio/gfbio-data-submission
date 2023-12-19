/**
 *
 * DataCategoryForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form/immutable';
import { DATA_CATEGORY_PREFIX } from '../../containers/SubmissionForm/constants';
// import PropTypes from 'prop-types';

/* eslint-disable react/prefer-stateless-function */
class DataCategoryForm extends React.PureComponent {
  // TODO: adapt for generic based solution instead of hardcoding all boxes
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Categories for this submission</h2>
          <p className="section-subtitle">(optional)</p>
        </header>

        <div className="form-row">
          <div className="form-group col-md-4">
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Algae & Protists`}
                id="algaeProtists"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="algaeProtists">
                Algae & Protists
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Bacteriology or Virology`}
                id="bacteriologyOrVirology"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label
                className="custom-control-label"
                htmlFor="bacteriologyOrVirology"
              >
                Bacteriology or Virology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Botany`}
                id="botany"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="botany">
                Botany
              </label>
            </div>
          </div>
          <div className="form-group col-md-4">
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Ecology & Environment`}
                id="ecologyEnvironment"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label
                className="custom-control-label"
                htmlFor="ecologyEnvironment"
              >
                Ecology & Environment
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Geoscience`}
                id="geoscience"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="geoscience">
                Geoscience
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Microbiology`}
                id="microbiology"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="microbiology">
                Microbiology
              </label>
            </div>
          </div>
          <div className="form-group col-md-4">
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Mycology`}
                id="mycology"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="mycology">
                Mycology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Palaeontology`}
                id="palaeontology"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="palaeontology">
                Palaeontology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${DATA_CATEGORY_PREFIX}Zoology`}
                id="zoology"
                component="input"
                type="checkbox"
                disabled={this.props.readOnly}
              />
              <label className="custom-control-label" htmlFor="zoology">
                Zoology
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

DataCategoryForm.propTypes = {
  readOnly: PropTypes.bool,
};

export default DataCategoryForm;

/**
 *
 * DataCategoryForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/immutable';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class DataCategoryForm extends React.PureComponent {
  // TODO: adapt for generic based solution instead of hardcoding all boxes
  render() {
    console.log('--------------render DataCategoryForm');
    console.log(this.props);
    console.log('###############################');
    const dataCategoryPrefix = 'data-category ';
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
                name={`${dataCategoryPrefix}Algae & Protists`}
                id="algaeProtists"
                component="input"
                type="checkbox"
              />
              <label className="custom-control-label" htmlFor="algaeProtists">
                Algae & Protists
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${dataCategoryPrefix}Bacteriology or Virology`}
                id="bacteriologyOrVirology"
                component="input"
                type="checkbox"
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
                name={`${dataCategoryPrefix}Botany`}
                id="botany"
                component="input"
                type="checkbox"
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
                name={`${dataCategoryPrefix}Ecology & Environment`}
                id="ecologyEnvironment"
                component="input"
                type="checkbox"
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
                name={`${dataCategoryPrefix}Geoscience`}
                id="geoscience"
                component="input"
                type="checkbox"
              />
              <label className="custom-control-label" htmlFor="geoscience">
                Geoscience
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${dataCategoryPrefix}Microbiology`}
                id="microbiology"
                component="input"
                type="checkbox"
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
                name={`${dataCategoryPrefix}Mycology`}
                id="mycology"
                component="input"
                type="checkbox"
              />
              <label className="custom-control-label" htmlFor="mycology">
                Mycology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${dataCategoryPrefix}Palaeontology`}
                id="palaeontology"
                component="input"
                type="checkbox"
              />
              <label className="custom-control-label" htmlFor="palaeontology">
                Palaeontology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <Field
                className="custom-control-input"
                name={`${dataCategoryPrefix}Zoology`}
                id="zoology"
                component="input"
                type="checkbox"
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

DataCategoryForm.propTypes = {};

export default DataCategoryForm;

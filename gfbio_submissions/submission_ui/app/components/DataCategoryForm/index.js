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
  // categoryList = [];
  //
  // categoryCheckBoxes = this.categoryList.map(category => (
  //   <div className="custom-control custom-checkbox">
  //     <Field name={category} id={category} component="input" type="checkbox" />
  //     <label className="custom-control-label" htmlFor={category}>
  //       {category}
  //     </label>
  //   </div>
  // ));

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
                name="algaeProtists"
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
                name="bacteriologyOrVirology"
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
                name="botany"
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
                name="ecologyEnvironment"
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
                name="geoscience"
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
                name="microbiology"
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
                name="mycology"
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
                name="palaeontology"
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
                name="zoology"
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

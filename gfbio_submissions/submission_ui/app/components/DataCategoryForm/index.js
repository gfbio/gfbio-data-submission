/**
 *
 * DataCategoryForm
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class DataCategoryForm extends React.PureComponent {
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
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck1"
              />
              <label className="custom-control-label" htmlFor="customCheck1">
                Algae & Protists
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck2"
              />
              <label className="custom-control-label" htmlFor="customCheck2">
                Bacteriology or Virology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck3"
              />
              <label className="custom-control-label" htmlFor="customCheck3">
                Botany
              </label>
            </div>
          </div>
          <div className="form-group col-md-4">
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck4"
              />
              <label className="custom-control-label" htmlFor="customCheck4">
                Ecology & Environment
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck5"
              />
              <label className="custom-control-label" htmlFor="customCheck5">
                Geoscience
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck6"
              />
              <label className="custom-control-label" htmlFor="customCheck6">
                Microbiology
              </label>
            </div>
          </div>
          <div className="form-group col-md-4">
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck7"
              />
              <label className="custom-control-label" htmlFor="customCheck7">
                Mycology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck8"
              />
              <label className="custom-control-label" htmlFor="customCheck8">
                Palaeontology
              </label>
            </div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                className="custom-control-input"
                id="customCheck9"
              />
              <label className="custom-control-label" htmlFor="customCheck9">
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

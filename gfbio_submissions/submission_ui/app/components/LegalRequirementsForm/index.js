/**
 *
 * LegalRequirementsForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/lib/immutable';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class LegalRequirementsForm extends React.PureComponent {
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Legal Requirements</h2>
          <p className="section-subtitle" />
        </header>
        <div className="form-group">
          <div className="custom-control custom-checkbox">
            <Field
              className="custom-control-input"
              name="nagoyaProtocol"
              id="nagoyaProtocol"
              component="input"
              type="checkbox"
            />
            <label className="custom-control-label" htmlFor="nagoyaProtocol">
              Nagoya Protocol
            </label>
          </div>
          <div className="custom-control custom-checkbox">
            <Field
              className="custom-control-input"
              name="iucnList"
              id="iucnList"
              component="input"
              type="checkbox"
            />
            <label className="custom-control-label" htmlFor="iucnList">
              IUCN Red List of Threatened Species
            </label>
          </div>
          <div className="custom-control custom-checkbox">
            <Field
              className="custom-control-input"
              name="personalInformation"
              id="personalInformation"
              component="input"
              type="checkbox"
            />
            <label
              className="custom-control-label"
              htmlFor="personalInformation"
            >
              Sensitive Personal Information
            </label>
          </div>
          <div className="custom-control custom-checkbox">
            <Field
              className="custom-control-input"
              name="uncertain"
              id="uncertain"
              component="input"
              type="checkbox"
              checked="checked"
            />
            <label className="custom-control-label" htmlFor="uncertain">
              Uncertain
            </label>
          </div>
        </div>
      </div>
    );
  }
}

LegalRequirementsForm.propTypes = {};

export default LegalRequirementsForm;

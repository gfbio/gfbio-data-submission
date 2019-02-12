/**
 *
 * UploadForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/immutable';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class UploadForm extends React.PureComponent {
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Upload Data</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <div className="form-group">
          <div className="custom-file">
            <Field
              name="upload"
              className="custom-file-input"
              component="input"
              type="file"
            />
            <label className="custom-file-label" htmlFor="customFile">
              Choose file
            </label>
          </div>
        </div>
      </div>
    );
  }
}

UploadForm.propTypes = {};

export default UploadForm;

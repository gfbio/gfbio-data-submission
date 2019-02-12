/**
 *
 * MinimalSubmissionForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/immutable';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class MinimalSubmissionForm extends React.PureComponent {
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Title</h2>
          <p className="section-subtitle" />
        </header>
        <div className="form-group">
          <Field
            name="title"
            className="form-control"
            component="input"
            type="text"
            placeholder="Enter a title for your submission"
          />
        </div>

        <header className="header header-left form-header-top">
          <h2 className="section-title">Description</h2>
          <p className="section-subtitle" />
        </header>
        <div className="form-group">
          <Field
            name="description"
            className="form-control"
            component="textarea"
            rows="7"
            placeholder="Enter some text describing your submission"
          />
        </div>
      </div>
    );
  }
}

MinimalSubmissionForm.propTypes = {};

export default MinimalSubmissionForm;

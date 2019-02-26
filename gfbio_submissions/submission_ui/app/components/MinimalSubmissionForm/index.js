/**
 *
 * MinimalSubmissionForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/immutable';
import UploadForm from '../UploadForm';
import { required } from './validation';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class MinimalSubmissionForm extends React.PureComponent {
  renderInputField = ({
    input,
    placeholder,
    type,
    meta: { touched, error, warning },
  }) => (
    <div>
      <div>
        <input
          {...input}
          placeholder={placeholder}
          type={type}
          className="form-control"
        />
        {touched &&
          ((error && <span className="input-error">{error}</span>) ||
            (warning && <span className="input-warning">{warning}</span>))}
      </div>
    </div>
  );

  renderTextAreaField = ({
    input,
    placeholder,
    type,
    rows,
    meta: { touched, error, warning },
  }) => (
    <div>
      <div>
        <textarea
          {...input}
          placeholder={placeholder}
          type={type}
          rows={rows}
          className="form-control"
        />
        {touched &&
          ((error && <span className="input-error">{error}</span>) ||
            (warning && <span className="input-warning">{warning}</span>))}
      </div>
    </div>
  );

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
            component={this.renderInputField}
            type="text"
            placeholder="Enter a title for your submission"
            validate={required}
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
            component={this.renderTextAreaField}
            rows="7"
            placeholder="Enter some text describing your submission"
            validate={required}
          />
        </div>

        <UploadForm />
      </div>
    );
  }
}

MinimalSubmissionForm.propTypes = {};

export default MinimalSubmissionForm;

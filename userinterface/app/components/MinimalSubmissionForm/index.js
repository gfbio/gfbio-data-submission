/**
 *
 * MinimalSubmissionForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
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
          disabled={this.props.readOnly}
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
          disabled={this.props.readOnly}
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
            props={{ readOnly: this.props.readOnly }}
            type="text"
            placeholder="Enter a title for your dataset"
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
            props={{ readOnly: this.props.readOnly }}
            rows="7"
            placeholder="Describe your dataset"
            validate={required}
          />
        </div>

        <UploadForm readOnly={this.props.readOnly} />
      </div>
    );
  }
}

MinimalSubmissionForm.propTypes = {
  readOnly: PropTypes.bool,
};

export default MinimalSubmissionForm;

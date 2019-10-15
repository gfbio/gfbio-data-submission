/**
 *
 * DataUrlForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/immutable';
import { urlValidation } from './validation';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class DataUrlForm extends React.PureComponent {
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

  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Data URL</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <div className="form-group">
          <Field
            name="download_url"
            className="form-control"
            component={this.renderInputField}
            type="text"
            placeholder="Link to your data, e.g. cloud storage"
            validate={urlValidation}
          />
        </div>
      </div>
    );
  }
}

DataUrlForm.propTypes = {};

export default DataUrlForm;

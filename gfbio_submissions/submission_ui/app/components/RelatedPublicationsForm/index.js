/**
 *
 * RelatedPublicationsForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/lib/immutable';
import { required } from '../MinimalSubmissionForm/validation';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class RelatedPublicationsForm extends React.PureComponent {
  // renderInputField = ({
  //                       input,
  //                       placeholder,
  //                       type,
  //                       meta: { touched, error, warning },
  //                     }) => (
  //   <div>
  //     <div>
  //       <input
  //         {...input}
  //         placeholder={placeholder}
  //         type={type}
  //         className="form-control"
  //       />
  //       {touched &&
  //       ((error && <span className="input-error">{error}</span>) ||
  //         (warning && <span className="input-warning">{warning}</span>))}
  //     </div>
  //   </div>
  // );

  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Related Publications</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <div className="form-row">
          <div className="form-group col-md-10">
            <Field
              name="relatedPublication"
              className="form-control"
              component="input"
              type="text"
              placeholder="Enter a publication or reference"
            />
          </div>
          <div className="form-group col-md-2">
            <button
              className="btn btn-secondary btn-block
              btn-light-blue-inverted">
              Add
            </button>
          </div>
        </div>
      </div>
    );
  }
}

RelatedPublicationsForm.propTypes = {};

export default RelatedPublicationsForm;

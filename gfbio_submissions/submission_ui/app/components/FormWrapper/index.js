/**
 *
 * FormWrapper
 *
 */

import React from 'react';
import { reduxForm } from 'redux-form/immutable';
// import PropTypes from 'prop-types';
import MinimalSubmissionForm from 'components/MinimalSubmissionForm';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class FormWrapper extends React.PureComponent {
  render() {
    return (
      <form name="wrapping-form" method="" className="pagewide-form">
        <div className="container">
          <div className="row">
            <div className="col-md-9">
              {/* left col */}
              <h2>Left col</h2>
              <MinimalSubmissionForm />
            </div>
            {/* end left col */}
            <div className="col-md-3">
              {/* right col */}
              <h2>Right Col</h2>
            </div>
            {/* end right col */}
          </div>
        </div>
      </form>
    );
  }
}

FormWrapper.propTypes = {};

export default reduxForm({ form: 'formWrapper' })(FormWrapper);

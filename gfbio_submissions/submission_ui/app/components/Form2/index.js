/**
 *
 * Form2
 *
 */

import React from 'react';
import { reduxForm } from 'redux-form/immutable';
import { Field } from 'redux-form/immutable';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class Form2 extends React.Component {
  render() {
    return (
      <form>
        <label>FORM 2</label>
        <div>
          <label htmlFor="firstName">First Name</label>
          <Field name="firstName" component="input" type="text" />
        </div>
      </form>
    );
  }
}

Form2.propTypes = {};

export default reduxForm({ form: 'form2' })(Form2);

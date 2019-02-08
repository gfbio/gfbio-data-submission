import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form/immutable';

let ContactForm = props => {
  const { handleSubmit } = props;
  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name</label>
        <Field name="firstName" component="input" type="text"/>
      </div>
      <div>
        <label htmlFor="lastName">Last Name</label>
        <Field name="lastName" component="input" type="text"/>
      </div>
      {/*<div>*/}
        {/*<label htmlFor="email">Email</label>*/}
        {/*<Field name="email" component="input" type="email"/>*/}
      {/*</div>*/}
      <button type="submit">Submit</button>
    </form>
  );
};

ContactForm.propTypes = {
  handleSubmit: PropTypes.func,
};

ContactForm = reduxForm({
  // a unique name for the form
  form: 'contact',
})(ContactForm);

export default ContactForm;

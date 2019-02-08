import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form/immutable';

// TODO: class or simple component once adapted to real submission form
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
      {/*
        TODO: submit can be trigered by remote component
        so this submit can be omitted.
        TODO: idea is to modularize (submission form components) and combine
        them independently under on submit and/or save action
        TODO: check wizard example
       */}
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

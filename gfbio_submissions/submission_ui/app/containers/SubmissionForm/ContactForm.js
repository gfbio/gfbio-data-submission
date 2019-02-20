import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form/immutable';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectContactForm } from './selectors';

// TODO: or PureComponent ? difference matters here ?
class ContactForm extends React.Component {

  render() {
    console.log('ContactForm RENDER');
    console.log(this.props);
    return (
      <form onSubmit={this.props.handleSubmit}>
        <div>
          <label htmlFor="firstName">First Name</label>
          <Field name="firstName" component="input" type="text" value="TEST" />
        </div>
        <div>
          <label htmlFor="lastName">Last Name</label>
          <Field name="lastName" component="input" type="text" />
        </div>
        <button className="btn btn-danger" type="submit">Submit</button>
        <div>
          <button className="btn btn-dark" type="button"
                  onClick={() => load(data)}>
            Load Account
          </button>
        </div>
      </form>
    );
  }
}

ContactForm.propTypes = {
  handleSubmit: PropTypes.func,
  initialValues: PropTypes.object,
  theState: PropTypes.any,
};

// ContactForm = reduxForm({
//   // a unique name for the form
//   form: 'contact',
//   // initialValues: {lastName: 'BLA'}
// })(ContactForm);

const mapStateToProps = createStructuredSelector({
  // initialValues: makeSelectInitialValue(),
  // works
  // theState: makeSelectFormWrapper(),
  theState: makeSelectContactForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    //handleSubmit: form => dispatch(submitForm2(form)),
    dispatch,
  };
}

/***  this block works, no redux form  ****/
// const withConnect = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// );
//
// // same reducer as SubmisisonForm injected under different key
// const withReducer = injectReducer({ key: 'CForm', reducer });
// const withSaga = injectSaga({ key: 'CForm', saga });
//
// console.info(withConnect);
// console.log(ContactForm);
//
// export default compose(
//   withReducer,
//   withSaga,
//   withConnect,
// )(ContactForm);
/***  this block works, no redux form  ****/


/***  this block works, no redux form  ****/
// export default connect(mapStateToProps, mapDispatchToProps)(ContactForm);
/***  this block works, no redux form  ****/


// works, no fields
// works with field, but intialValues is not fetched from submForm.reducer ?
//      I'guess connected to form reducer as injected globally
ContactForm = connect(mapStateToProps, mapDispatchToProps)(ContactForm);

// settings initialValues here directly works
//enableReinitialize: true,
// export default reduxForm({ form: 'contact', enableReinitialize : true })(ContactForm);

// setting initial values dynamically only works via properties
// stackoverflow says connect has to be called after reduxForm
// but when I do so, nothing gets rendered
ContactForm = reduxForm({
  form: 'contact',
  enableReinitialize: true,
})(ContactForm);

// ContactForm = connect()(ContactForm);

export default ContactForm;

// let CF = reduxForm({ form: 'contact', enableReinitialize : true })(ContactForm);
// CF = connect(mapStateToProps, mapDispatchToProps)(CF);
// export default CF;

/**
 *
 * SubmissionForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import ContactForm from './ContactForm';
import makeSelectSubmissionForm from './selectors';
import reducer from './reducer';
import saga from './saga';
import messages from './messages';
import { submitForm } from './actions';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionForm extends React.Component {
  submit = values => {
    // print the form values to the console
    console.log(values);
  };

  render() {
    // {/* <FormattedMessage {...messages.header} /> */}
    // {/*<ContactForm onSubmit={this.submit} />*/}
    console.log('render SubmissionForm');
    return (
      <div>
        <FormattedMessage {...messages.header} />
        <h1>FORM ?</h1>
        <ContactForm onSubmit={this.submit} />
      </div>
    );
  }
}

SubmissionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  submissionForm: makeSelectSubmissionForm(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleSubmit: form => dispatch(submitForm(form)),
  };
}

// const withReduxForm = reduxForm({
//   // a unique name for the form
//   form: 'contact',
// });

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'submissionForm', reducer });
const withSaga = injectSaga({ key: 'submissionForm', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
  // withReduxForm,
)(SubmissionForm);

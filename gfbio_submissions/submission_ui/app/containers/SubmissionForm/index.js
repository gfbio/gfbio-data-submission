/**
 *
 * SubmissionForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectSubmissionForm from './selectors';
import reducer from './reducer';
import saga from './saga';
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
      <div id="submission-form-wrapper">
        <h1>APP</h1>
        {/* TODO: is id necessary ? */}

        <section className="sub-navi">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <nav className="nav">
                  <a className="nav-link" href="#">
                    My Submissions
                  </a>
                  <a className="nav-link active" href="#">
                    Create Submission
                  </a>
                  <a className="nav-link" href="#">
                    Help
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </section>

        {/* <FormattedMessage {...messages.header} /> */}
        {/* <h1>FORM ?</h1> */}
        {/* /!*<ContactForm onSubmit={this.submit} />*!/ */}
        {/* <ContactForm onSubmit={this.props.handleSubmit} /> */}
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
)(SubmissionForm);

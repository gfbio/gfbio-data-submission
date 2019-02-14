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
import FormWrapper from 'components/FormWrapper';
import reducer from './reducer';
import saga from './saga';
import { saveForm, submitForm } from './actions';
import makeSelectSubmissionForm, { makeSelectFormWrapper } from './selectors';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionForm extends React.Component {
  render() {
    return (
      <div id="submission-form-wrapper">
        {/* TODO: is div id necessary ? */}
        {/* TODO: extract to component. */}
        {/* TODO: candidate for redux-router */}
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

        <FormWrapper
          onSubmit={this.props.handleSubmit}
          handleSave={this.props.handleSave}
        />
      </div>
    );
  }
}

SubmissionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  // TODO: maybe remove once save workflow is established
  // submissionForm: PropTypes.object,
  // reduxFormForm: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  submissionForm: makeSelectSubmissionForm(),
  // TODO: maybe remove once save workflow is established
  reduxFormForm: makeSelectFormWrapper(),
});

// TODO: Decision has to be made to handle save by accessing 'formWrapper'
//  from global state via selector
//  or
//  use form.onSubmit with parameter in method. this way validation will
//  happen on save like on submit
// but there is only on signal for sagas to take, maybe fork saga ?
function mapDispatchToProps(dispatch) {
  return {
    handleSubmit: form => dispatch(submitForm(form)),
    handleSave: () => dispatch(saveForm()),
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

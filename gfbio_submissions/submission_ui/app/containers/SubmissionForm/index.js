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
import { saveForm, setEmbargoDate, submitForm } from './actions';
import makeSelectSubmissionForm, {
  makeSelectEmbargoDate,
  makeSelectFormWrapper,
  makeSelectInitialValue,
  makeSelectSaveInProgress,
  makeSelectSubmitInProgress,
} from './selectors';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionForm extends React.Component {

  // submit = values => {
  //   // print the form values to the console
  //   console.log('submit func from SubForm');
  //   console.log(values);
  // };
  //
  getProfile = () => {
    return {
      ui_settings: {
        minimal: {
          visible: true,
          default: {
            title: 'profile-title',
            description: 'profile-description',
          },
        },
      },
    };
  };

  render() {
    // console.log('SubmissionForm');
    // console.log(this.props);
    return (
      <div id="submission-form-wrapper">

        {/*<ContactForm onSubmit={this.submit} initialValues={this.props.initialValues}/>*/}

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
        {/* TODO: FormWrapper is a good candidate for its own store connectio */}
        <FormWrapper
          onSubmit={this.props.handleSubmit}
          handleSave={this.props.handleSave}
          submitInProgress={this.props.submitInProgress}
          saveInProgress={this.props.saveInProgress}
          handleDateChange={this.props.handleDateChange}
          embargoDate={this.props.embargoDate}
          // profile does not work for pre-fill
          profile={this.getProfile()}
          // this works to pre-fill
          // initialValues={this.getInitialVals()}
          // this works, and react to state change
          initialValues={this.props.initialValues}
        />
      </div>
    );
  }
}

SubmissionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleSave: PropTypes.func.isRequired,
  submitInProgress: PropTypes.bool,
  // saveInProgress: PropTypes.bool,
  embargoDate: PropTypes.instanceOf(Date),
  // embargoDate: PropTypes.string,
  handleDateChange: PropTypes.func,
  // TODO: maybe remove once save workflow is established
  // submissionForm: PropTypes.object,
  // reduxFormForm: PropTypes.object,
  initialValues: PropTypes.object,

};

const mapStateToProps = createStructuredSelector({
  submissionForm: makeSelectSubmissionForm(),
  // TODO: maybe remove once save workflow is established
  reduxFormForm: makeSelectFormWrapper(),
  submitInProgress: makeSelectSubmitInProgress(),
  saveInProgress: makeSelectSaveInProgress(),
  embargoDate: makeSelectEmbargoDate(),
  initialValues: makeSelectInitialValue(),
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
    handleDateChange: date => dispatch(setEmbargoDate(date)),
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

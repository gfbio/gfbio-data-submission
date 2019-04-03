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
import { fetchSubmission, setEmbargoDate, submitForm } from './actions';
import {
  makeSelectEmbargoDate,
  makeSelectFormWrapper,
  makeSelectSaveInProgress,
  makeSelectSubmission,
  makeSelectSubmitInProgress,
} from './selectors';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionForm extends React.Component {

  componentDidMount() {
    console.log('--------------- componentDidMount SubmissionForm');
    // console.log(this.props);
    const { brokerSubmissionId } = this.props.match.params;
    console.log('\tbsi:');
    console.log(brokerSubmissionId);
    console.log('###############################');
    if (typeof brokerSubmissionId != undefined) {
      console.log('\t---> load submission for ' + brokerSubmissionId);
      this.props.fetchSubmission(brokerSubmissionId);

    }
  }

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

  // TODO: remove, testing only
  getInitialVals = () => {
    return {
      title: 'initial-title',
      description: 'initial-description',
    }
  };

  render() {

    console.log('--------------render SubmissionForm');
    console.log(this.props.submission);
    console.log('###############################');

    /*
    *  TODO: - set preliminary version of data send as submission
    *        - assemble inital values for FormWrapper from loaded submission
    *        - some vals to serve as initialValues (consumed by redux form with this property name)
    *        - some vals have to be pre-processed, in extra prop (e.g. nonFormInitialValues),
    *             to set non-form fields accordingly. e.g. license
    *        - maybe some vals have to be set in reducer to show up in store
    *        - adapt submit/save processes to update instead of submit new (set/use brokerSubnmissionId ?)
    *        - list of uploaded files and edit this list is new story -> next ?
    *
    *  */

    return (
      <div className="submission-form-wrapper">
        {/*<h1 className="current-location"><i*/}
        {/*  className="icon ion-ios-add-circle-outline pr-3" />Create Submission*/}
        {/*</h1>*/}
        {/* TODO: working example for initial form values, refer to VCS */}
        {/*<ContactForm onSubmit={this.submit} initialValues={this.props.initialValues}/>*/}

        {/* TODO: top or bottom sticky ?*/}
        {/*<section className="sub-navi sticky-top sidebar bg-light">*/}
        {/*  <div className="container">*/}
        {/*    <div className="row">*/}
        {/*      <div className="col-sm-12">*/}
        {/*        <h1>sticky top</h1>*/}
        {/*      </div>*/}
        {/*    </div>*/}
        {/*  </div>*/}
        {/*</section>*/}

        {/* TODO: FormWrapper is a good candidate for its own store connectio */}
        <FormWrapper
          onSubmit={this.props.handleSubmit}
          submitInProgress={this.props.submitInProgress}
          saveInProgress={this.props.saveInProgress}
          handleDateChange={this.props.handleDateChange}
          embargoDate={this.props.embargoDate}
          // profile does not work for pre-fill
          profile={this.getProfile()}
          // this works to pre-fill
          initialValues={this.getInitialVals()}
          // this works, and react to state change

          // TODO: set proper vals from submission
          // initialValues={this.props.initialValues}


          reduxFormWrapper={this.props.reduxFormForm.formWrapper}
        />
      </div>
    );
  }
}

SubmissionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitInProgress: PropTypes.bool,
  embargoDate: PropTypes.instanceOf(Date),
  handleDateChange: PropTypes.func,
  // TODO: maybe remove once save workflow is established
  // submissionForm: PropTypes.object,
  reduxFormForm: PropTypes.object,
  // initialValues: PropTypes.object,
  submission: PropTypes.object,
  fetchSubmission: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  // submissionForm: makeSelectSubmissionForm(),
  // TODO: maybe remove once save workflow is established
  reduxFormForm: makeSelectFormWrapper(),
  submitInProgress: makeSelectSubmitInProgress(),
  saveInProgress: makeSelectSaveInProgress(),
  embargoDate: makeSelectEmbargoDate(),
  // initialValues: makeSelectInitialValue(),
  submission: makeSelectSubmission(),
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
    handleDateChange: date => dispatch(setEmbargoDate(date)),
    fetchSubmission: brokerSubmissionId => dispatch(fetchSubmission(brokerSubmissionId)),
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

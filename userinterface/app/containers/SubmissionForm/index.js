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
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';
import reducer from './reducer';
import saga from './saga';
import {
  fetchSubmission,
  resetForm,
  submitForm,
  closeSubmitError,
} from './actions';
import {
  makeSelectBrokerSubmissionId,
  makeSelectAccessionId,
  makeSelectFormWrapper,
  makeSelectGeneralError,
  makeSelectInitialValues,
  makeSelectPromptOnLeave,
  makeSelectSaveInProgress,
  makeSelectShowSaveSuccess,
  makeSelectSubmitError,
  makeSelectSubmissionErrors,
  makeSelectSubmission,
  makeSelectSubmitInProgress,
} from './selectors';
import { forEach } from 'react-bootstrap/utils/ElementChildren';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionForm extends React.Component {
  componentDidMount() {
    const { brokerSubmissionId } = this.props.match.params;
    if (brokerSubmissionId !== undefined) {
      this.props.fetchSubmission(brokerSubmissionId);
    }
  }

  getProfile = () => ({
    ui_settings: {
      minimal: {
        visible: true,
        default: {
          title: 'profile-title',
          description: 'profile-description',
        },
      },
    },
  });

  // renderNavigationPrompt = () => {
  //   return (
  //     <NavigationPrompt when={true}>
  //       {({ onConfirm, onCancel }) => (
  //         <Modal
  //           show={true}
  //           onHide={onCancel}
  //           backdrop={true}
  //           centered
  //         >
  //           <Modal.Header closeButton>
  //             <Modal.Title className="pl-4">Leave this section ?</Modal.Title>
  //           </Modal.Header>
  //           <Modal.Body>
  //             <Container>
  //               <Row className="show-grid text-center">
  //                 <Col xs={12} md={12}>
  //                   Are you sure leaving this form ? Press 'Cancel' to stay
  //                   or press 'Save' to save changes before leaving.
  //                   Press 'Discard' to leave with out saving.
  //                 </Col>
  //               </Row>
  //             </Container>
  //           </Modal.Body>
  //           <Modal.Footer>
  //             <Container>
  //               <Row className="show-grid">
  //                 <Col xs={12} md={4}>
  //                   <Button variant="secondary"
  //                           className="btn-block btn-sm green"
  //                           onClick={onCancel}>
  //                     <i className="icon ion-md-close" />
  //                     Cancel
  //                   </Button>
  //                 </Col>
  //                 <Col xs={12} md={4} className="text-right">
  //                   <Button variant="secondary"
  //                           className="btn-block btn-sm btn-light-blue"
  //                           onClick={this.props.handleSubmit}>
  //                     <i className="icon ion-ios-save" />
  //                     Save
  //                   </Button>
  //                 </Col>
  //                 <Col xs={12} md={4} className="text-right">
  //                   <Button variant="secondary"
  //                           className="btn-block btn-sm red"
  //                           onClick={onConfirm}>
  //                     <i className="icon ion-md-alert" />
  //                     Discard
  //                   </Button>
  //                 </Col>
  //               </Row>
  //             </Container>
  //           </Modal.Footer>
  //         </Modal>
  //       )}
  //     </NavigationPrompt>
  //   );
  // };

  render() {
    console.info('RENDER SUBMISSIONFORM');
    console.info(this.props);

    if (
      this.props.brokerSubmissionId !== '' &&
      this.props.match.path === '/form'
    ) {
      this.props.resetForm();
    }

    // TODO: add action for saga to fetch that removes this after a few seconds
    const saveMessage = (
      <Collapse in={this.props.showSaveSuccess}>
        <div className="gray-background">
          <div className="col-12">
            <header className="header save-header">
              <h2 className="section-title">
                <i className="fa fa-check" aria-hidden="true" />
                Save successful
              </h2>
            </header>
            <p className="save-text">All changes have been saved.</p>
            {/* <Button variant="secondary" */}
            {/*        className="btn-sm btn-green-inverted" */}
            {/*        onClick={this.props.closeSaveSuccess}> */}
            {/*  Close */}
            {/* </Button> */}
          </div>
        </div>
      </Collapse>
    );
    const submissionErrors = () => {
      const errors = [];
      this.props.submissionErrors.forEach(e => {
        errors.push(e);
        errors.push(<br />);
      });
      return errors;
    };
    const errorMessage = (
      <Collapse in={this.props.submitError}>
        <div className="gray-background">
          <div className="col-12">
            <header className="header error-header">
              <h2 className="section-title">
                <i className="fa fa-times" aria-hidden="true" />
                Submit Error
              </h2>
            </header>
            <p className="save-text">{submissionErrors()}</p>
            <Button
              variant="secondary"
              className="btn-sm btn-green-inverted"
              onClick={this.props.closeSubmitError}
            >
              Close
            </Button>
          </div>
        </div>
      </Collapse>
    );
    /*
    *  TODO: - adapt submit/save processes to update instead of submit new (set/use brokerSubnmissionId ?)
    *        - list of uploaded files and edit this list is new story -> next ?
    *  */

    // FIXME: refactor to remove redundant use etc of values. e.g. bsi is included in submission(.bsi)
    let issue = '';
    if (this.props.submission && this.props.submission.issue) {
      issue = this.props.submission.issue;
    }
    return (
      <div className="submission-form-wrapper">
        <FormWrapper
          onSubmit={this.props.handleSubmit}
          submitInProgress={this.props.submitInProgress}
          saveInProgress={this.props.saveInProgress}
          // profile does not work for pre-fill
          profile={this.getProfile()}
          initialValues={this.props.initialValues}
          reduxFormWrapper={this.props.reduxFormForm.formWrapper}
          promptOnLeave={this.props.promptOnLeave}
          generalError={this.props.generalError}
          saveSuccessMessage={saveMessage}
          submitErrorMessage={errorMessage}
          brokerSubmissionId={this.props.brokerSubmissionId}
          accessionId={this.props.accessionId}
          issue={issue}
        />
      </div>
    );
  }
}

SubmissionForm.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitInProgress: PropTypes.bool,
  embargoDate: PropTypes.instanceOf(Date),
  reduxFormForm: PropTypes.object,
  initialValues: PropTypes.object,
  submission: PropTypes.object,
  brokerSubmissionId: PropTypes.string,
  fetchSubmission: PropTypes.func,
  resetForm: PropTypes.func,
  promptOnLeave: PropTypes.bool,
  showSaveSuccess: PropTypes.bool,
  submitError: PropTypes.bool,
  submissionErrors: PropTypes.array,
  generalError: PropTypes.bool,
  closeSubmitError: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  reduxFormForm: makeSelectFormWrapper(),
  submitInProgress: makeSelectSubmitInProgress(),
  saveInProgress: makeSelectSaveInProgress(),
  initialValues: makeSelectInitialValues(),
  submission: makeSelectSubmission(),
  brokerSubmissionId: makeSelectBrokerSubmissionId(),
  accessionId: makeSelectAccessionId(),
  promptOnLeave: makeSelectPromptOnLeave(),
  showSaveSuccess: makeSelectShowSaveSuccess(),
  submitError: makeSelectSubmitError(),
  submissionErrors: makeSelectSubmissionErrors(),
  generalError: makeSelectGeneralError(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleSubmit: form => dispatch(submitForm(form)),
    fetchSubmission: brokerSubmissionId =>
      dispatch(fetchSubmission(brokerSubmissionId)),
    resetForm: () => dispatch(resetForm()),
    closeSubmitError: () => dispatch(closeSubmitError()),
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

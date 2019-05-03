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
import NavigationPrompt from 'react-router-navigation-prompt';
import Modal from 'react-bootstrap/Modal';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import FormWrapper from 'components/FormWrapper';
import reducer from './reducer';
import saga from './saga';
import {
  fetchSubmission,
  resetForm,
  setEmbargoDate,
  submitForm,
} from './actions';
import {
  makeSelectBrokerSubmissionId,
  makeSelectEmbargoDate,
  makeSelectFormWrapper,
  makeSelectInitialValues,
  makeSelectSaveInProgress,
  makeSelectSubmission,
  makeSelectSubmitInProgress,
} from './selectors';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionForm extends React.Component {

  componentDidMount() {
    console.log('SFORM did mount props');
    console.log(this.props);
    const { brokerSubmissionId } = this.props.match.params;
    if (brokerSubmissionId !== undefined) {
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

    // console.log('--------------render SubmissionForm');
    // console.log(this.props);
    // console.log('###############################');

    if (this.props.brokerSubmissionId !== '' && this.props.match.path === '/form') {
      this.props.resetForm();
    }

    /*
    *  TODO: - adapt submit/save processes to update instead of submit new (set/use brokerSubnmissionId ?)
    *        - list of uploaded files and edit this list is new story -> next ?
    *  */

    return (
      <div className="submission-form-wrapper">
        {/*<NavigationPrompt when={true}>*/}
        {/*  {({ onConfirm, onCancel }) => (*/}
        {/*    <Modal*/}
        {/*      show={true}*/}
        {/*      onHide={onCancel}*/}
        {/*      backdrop={true}*/}
        {/*      centered*/}
        {/*    >*/}
        {/*      <Modal.Header closeButton>*/}
        {/*        <Modal.Title className="pl-4">Leave this section ?</Modal.Title>*/}
        {/*      </Modal.Header>*/}
        {/*      <Modal.Body>*/}
        {/*        <Container>*/}
        {/*          <Row className="show-grid text-center">*/}
        {/*            <Col xs={12} md={12}>*/}
        {/*              Are you sure leaving this form ? Press 'Cancel' to stay*/}
        {/*              or press 'Save' to save changes before leaving.*/}
        {/*              Press 'Discard' to leave with out saving.*/}
        {/*            </Col>*/}
        {/*          </Row>*/}
        {/*        </Container>*/}
        {/*      </Modal.Body>*/}
        {/*      <Modal.Footer>*/}
        {/*        <Container>*/}
        {/*          <Row className="show-grid">*/}
        {/*            <Col xs={12} md={4}>*/}
        {/*              <Button variant="secondary"*/}
        {/*                      className="btn-block btn-sm green"*/}
        {/*                      onClick={onCancel}>*/}
        {/*                <i className="icon ion-md-close" />*/}
        {/*                Cancel*/}
        {/*              </Button>*/}
        {/*            </Col>*/}
        {/*            <Col xs={12} md={4} className="text-right">*/}
        {/*              <Button variant="secondary"*/}
        {/*                      className="btn-block btn-sm btn-light-blue"*/}
        {/*                      onClick={this.props.deleteSubmission}>*/}
        {/*                <i className="icon ion-ios-save" />*/}
        {/*                Save*/}
        {/*              </Button>*/}
        {/*            </Col>*/}
        {/*            <Col xs={12} md={4} className="text-right">*/}
        {/*              <Button variant="secondary"*/}
        {/*                      className="btn-block btn-sm red"*/}
        {/*                      onClick={onConfirm}>*/}
        {/*                <i className="icon ion-md-alert" />*/}
        {/*                Discard*/}
        {/*              </Button>*/}
        {/*            </Col>*/}
        {/*          </Row>*/}
        {/*        </Container>*/}
        {/*      </Modal.Footer>*/}
        {/*    </Modal>*/}
        {/*  )}*/}
        {/*</NavigationPrompt>*/}
        {/*<Prompt*/}
        {/*  when={true}*/}
        {/*  message="Are you sure you want to leave?"*/}
        {/*/>*/}
        <FormWrapper
          onSubmit={this.props.handleSubmit}
          submitInProgress={this.props.submitInProgress}
          saveInProgress={this.props.saveInProgress}
          handleDateChange={this.props.handleDateChange}
          embargoDate={this.props.embargoDate}
          // profile does not work for pre-fill
          profile={this.getProfile()}
          initialValues={this.props.initialValues}
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
  reduxFormForm: PropTypes.object,
  initialValues: PropTypes.object,
  submission: PropTypes.object,
  brokerSubmissionId: PropTypes.string,
  fetchSubmission: PropTypes.func,
  resetForm: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  reduxFormForm: makeSelectFormWrapper(),
  submitInProgress: makeSelectSubmitInProgress(),
  saveInProgress: makeSelectSaveInProgress(),
  embargoDate: makeSelectEmbargoDate(),
  initialValues: makeSelectInitialValues(),
  submission: makeSelectSubmission(),
  brokerSubmissionId: makeSelectBrokerSubmissionId(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleSubmit: form => dispatch(submitForm(form)),
    handleDateChange: date => dispatch(setEmbargoDate(date)),
    fetchSubmission: brokerSubmissionId => dispatch(fetchSubmission(brokerSubmissionId)),
    resetForm: () => (dispatch(resetForm())),
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

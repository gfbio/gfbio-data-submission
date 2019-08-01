/**
 *
 * SubmissionList
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Link } from 'react-router-dom';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import {
  makeSelectDeleteSubmissionDialog,
  makeSelectSubmissions,
} from './selectors';
import reducer from './reducer';
import saga from './saga';
import {
  closeDeleteSubmissionDialog,
  deleteSubmission,
  fetchSubmissions,
  showDeleteSubmissionDialog,
} from './actions';
import { makeSelectShowSubmitSuccess } from '../SubmissionForm/selectors';
import { closeSubmitSuccess } from '../SubmissionForm/actions';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { STATUS_CANCELLED } from '../../globalConstants';


/* eslint-disable react/prefer-stateless-function */
export class SubmissionList extends React.Component {

  componentDidMount() {
    this.props.fetchSubmissions();
  }

  render() {
    // console.log('--------------render SubmissionList');
    // console.log(this.props);
    // console.log('###############################');

    let submissionItems = this.props.submissions.map((submission, index) => {
      if (submission.status != STATUS_CANCELLED) {
        return <li key={index} className="list-group-item">
          <div className="row wrapping-row no-gutters">
            <div className="col-md-10">
              {/*left*/}
              <Link className="row no-gutters"
                    to={'/form/' + submission.broker_submission_id}>
                <div className="col-md-9 col-sm-12 align-self-center">
                  {/*icon ion-ios-redo*/}
                  <i className="icon ion-md-apps" />
                  <span>{submission.data.requirements.title}</span>
                </div>
                <div className="col-md-3 col-sm-12 align-self-center status">
                <span className="">
                  {submission.status}
                </span>
                </div>
              </Link>
            </div>
            <div className="col-md-2 col-sm-12 align-self-center actions">
              <Link className="action h-100 d-inline-block pr-4"
                    to={'/form/' + submission.broker_submission_id}>
                <i className="icon ion-md-create" /> Edit
              </Link>
              <a className="action h-100 d-inline-block"
                 href=""
                 onClick={(e) => {
                   e.preventDefault();
                   this.props.showDeleteSubmissionDialog(submission.broker_submission_id);
                 }}
              >
                <i className="icon ion-md-trash" />Delete</a>
            </div>
          </div>

        </li>;
      } else {
        return null;
      }

    });
    submissionItems = submissionItems.filter(item => item !== null);
    let header = null;

    let startNew = (
      <div className="list-start-wrapper d-flex">
        <div className="container my-auto">
          <div className="row no-gutters text-center">
            <div className="col-md-10 pl-3 align-middle">
              <Link className="nav-link list-start" to="/form">
                <p>
                  You have no submissions yet.
                </p>
                <i className="icon ion-ios-add-circle-outline" />
                <p>
                  Start a new submission
                </p>
              </Link>
              {/*  </div>*/}
              {/*</div>*/}
            </div>
          </div>
        </div>
      </div>
    );

    if (submissionItems.length > 0) {
      startNew = null;
      header = (
        <div className="row no-gutters">
          <div className="col-md-10 pl-3">
            <div className="row no-gutters">
              <div className="col-md-9 align-self-center">
                <h6>Title</h6>
              </div>
              <div className="col-md-3 align-self-center">
                <h6>Status</h6>
              </div>
            </div>
          </div>
          <div className="col-md-2">

          </div>
        </div>
      );
    }

    // TODO: now that everything is set up, continue with get subs in saga
    // set loading indicator, fetch subs, on error show message, on success
    // show list

    return (
      <div className="submission-list-wrapper">
        <Collapse
          in={this.props.showSubmitSuccess}
        >
          <div className="col-8 mx-auto success-message">
            <div className="row">
              <div className="col-1 mx-auto">
                <i
                  className="icon ion-md-checkmark-circle-outline align-bottom" />
              </div>
              <div className="col-8">
                <h4>Your data was submitted !</h4>
                <p>
                  Congratulations, you have started a data submission.
                  You will receive a confirmation email from the GFBio
                  Helpdesk Team. Please reply to this email if you have
                  questions.
                </p>
              </div>
              <div className="col-2">
                <Button variant="secondary"
                        className="btn-sm btn-block btn-green-inverted"
                        onClick={this.props.closeSaveSuccess}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Collapse>

        <Modal
          show={this.props.deleteSubmissionDialog}
          onHide={this.props.closeDeleteSubmissionDialog}
          backdrop={true}
          centered
        >

          <Modal.Header closeButton>
            <Modal.Title className="pl-4">Delete Submission ?</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Container>
              <Row className="show-grid text-center">
                <Col xs={12} md={12}>
                  Do you really want to delete this submission ?
                </Col>
              </Row>
            </Container>

          </Modal.Body>

          <Modal.Footer>
            <Container>
              <Row className="show-grid">
                <Col xs={12} md={6}>
                  <Button variant="secondary" className="btn-block green"
                          onClick={this.props.closeDeleteSubmissionDialog}>
                    <i className="icon ion-md-close" />
                    Cancel
                  </Button>
                </Col>
                <Col xs={12} md={6} className="text-right">
                  <Button variant="secondary" className="btn-block red"
                          onClick={this.props.deleteSubmission}>
                    <i className="icon ion-md-trash" />
                    Delete
                  </Button>
                </Col>
              </Row>
            </Container>
          </Modal.Footer>
        </Modal>


        <div className="container">
          {header}
        </div>
        <div className="container">
          {startNew}
          <ul className="list-group">
            {submissionItems}
          </ul>
        </div>
      </div>
    );
  }
}

SubmissionList.propTypes = {
  fetchSubmissions: PropTypes.func,
  submissions: PropTypes.array,
  showSubmitSuccess: PropTypes.bool,
  closeSaveSuccess: PropTypes.func,
  deleteSubmission: PropTypes.func,
  showDeleteSubmissionDialog: PropTypes.func,
  closeDeleteSubmissionDialog: PropTypes.func,
  deleteSubmissionDialog: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  // submissionList: makeSelectSubmissionList(),
  submissions: makeSelectSubmissions(),
  showSubmitSuccess: makeSelectShowSubmitSuccess(),
  deleteSubmissionDialog: makeSelectDeleteSubmissionDialog(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchSubmissions: () => dispatch(fetchSubmissions()),
    closeSaveSuccess: () => dispatch(closeSubmitSuccess()),
    // TODO: warning modal
    showDeleteSubmissionDialog: (brokerSubmissionId) => dispatch(showDeleteSubmissionDialog(brokerSubmissionId)),
    closeDeleteSubmissionDialog: () => dispatch(closeDeleteSubmissionDialog()),
    deleteSubmission: (brokerSubmissionId) => dispatch(deleteSubmission(brokerSubmissionId)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'submissionList', reducer });
const withSaga = injectSaga({ key: 'submissionList', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(SubmissionList);

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
import { makeSelectShowSaveSuccess } from '../SubmissionForm/selectors';
import { closeSaveSuccess } from '../SubmissionForm/actions';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';


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
            {/*right pr-4 pl-4*/}
            <a className="action h-100 d-inline-block pr-4" href="">
              <i className="icon ion-md-create" /> Edit
            </a>
            <a className="action h-100 d-inline-block"
               href=""
               onClick={(e) => {
                 e.preventDefault();
                 console.log('ON CLICK LIST DELETE');
                 console.log(submission.broker_submission_id);
                 this.props.showDeleteSubmissionDialog(submission.broker_submission_id);
               }}
            >
              <i className="icon ion-md-trash" />Delete</a>
          </div>
        </div>

      </li>;
    });

    let header = null;
    if (submissionItems.length > 0) {
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
    //  set loading indicator, fetch subs, on error show message, on success
    //  show list

    return (
      <div className="submission-list-wrapper">
        <Collapse
          in={this.props.showSaveSuccess}
        >
          <div className="col-8 mx-auto success-message">
            <div className="row">
              <div className="col-1 mx-auto">
                <i
                  className="icon ion-md-checkmark-circle-outline align-bottom" />
              </div>
              <div className="col-8">
                <h4>Your submission was saved</h4>
                <p>
                  Anim pariatur cliche reprehenderit, enim eiusmod high life
                  accusamus
                  terry richardson ad squid. Nihil anim keffiyeh helvetica,
                  craft
                  beer
                  labore wes anderson cred nesciunt sapiente ea proident.
                </p>
              </div>
              <div className="col-2">
                <Button variant="secondary"
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
                  {/*    <code>.col-xs-12 .col-md-8</code>*/}
                  {/*  </Col>*/}
                  {/*  <Col xs={6} md={4}>*/}
                  {/*    <code>.col-xs-6 .col-md-4</code>*/}
                  {/*  </Col>*/}
                  {/*</Row>*/}

                  {/*<Row className="show-grid">*/}
                  {/*  <Col xs={6} md={4}>*/}
                  {/*    <code>.col-xs-6 .col-md-4</code>*/}
                  {/*  </Col>*/}
                  {/*  <Col xs={6} md={4}>*/}
                  {/*    <code>.col-xs-6 .col-md-4</code>*/}
                  {/*  </Col>*/}
                  {/*  <Col xs={6} md={4}>*/}
                  {/*    <code>.col-xs-6 .col-md-4</code>*/}
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
  showSaveSuccess: PropTypes.bool,
  closeSaveSuccess: PropTypes.func,
  deleteSubmission: PropTypes.func,
  showDeleteSubmissionDialog: PropTypes.func,
  closeDeleteSubmissionDialog: PropTypes.func,
  deleteSubmissionDialog: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  // submissionList: makeSelectSubmissionList(),
  submissions: makeSelectSubmissions(),
  showSaveSuccess: makeSelectShowSaveSuccess(),
  deleteSubmissionDialog: makeSelectDeleteSubmissionDialog(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchSubmissions: () => dispatch(fetchSubmissions()),
    closeSaveSuccess: () => dispatch(closeSaveSuccess()),
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

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
import { makeSelectSubmissions } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { fetchSubmissions } from './actions';
import { makeSelectShowSaveSuccess } from '../SubmissionForm/selectors';
import { closeSaveSuccess } from '../SubmissionForm/actions';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionList extends React.Component {

  // constructor(props, context) {
  //   super(props, context);
  //
  //   this.handleShow = this.handleShow.bind(this);
  //   this.handleClose = this.handleClose.bind(this);
  //
  //   this.state = {
  //     show: false,
  //   };
  // }
  //
  // handleClose() {
  //   this.setState({ show: false });
  // }
  //
  // handleShow() {
  //   this.setState({ show: true });
  // }


  componentDidMount() {
    this.props.fetchSubmissions();
  }


  render() {
    // console.log('--------------render SubmissionList');
    // console.log(this.props);
    // console.log('###############################');

    let submissionItems = this.props.submissions.map((submission, index) => {
      return <li key={index} className="list-group-item">
        <Link className="row no-gutters"
              to={'/form/' + submission.broker_submission_id}>
          <div className="col-md-8 col-sm-12 align-self-center title">
            {/*icon ion-ios-redo*/}
            <i className="icon ion-md-apps" />
            <span>{submission.data.requirements.title}</span>
          </div>
          <div className="col-md-2 col-sm-12 align-self-center status">
            <span className="">
              {submission.status}
            </span>
          </div>
          {/*<div className="col-md-1 edit">*/}
          {/* if saved, else submitted and no edit possible */}
          {/*<span>Edit</span>*/}
          {/*</div>*/}
          <div className="col-md-2 col-sm-12 align-self-center actions">
            <a className="action h-100 d-inline-block pr-4 pl-4"><i
              className="icon ion-md-create" />Edit</a>
            <a className="action h-100 d-inline-block"><i
              className="icon ion-md-trash" />Delete</a>
            {/*<span className="ti-pencil"></span>Edit*/}
            {/*<span></span>*/}
          </div>
          {/*{submission.broker_submission_id}*/}
        </Link>
      </li>;
    });

    let header = null;
    if (submissionItems.length > 0) {
      header = <div className="row no-gutters">
        <div className="col-sm-8">
          <h6>Title</h6>
        </div>
        <div className="col-sm-2">
          <h6>Status</h6>
        </div>
        <div className="col-sm-2">
          {/*<h6>Actions</h6>*/}
        </div>
      </div>;
    }

    // TODO: now that everything is set up, continue with get subs in saga
    //  set loading indicator, fetch subs, on error show message, on success
    //  show list

    return (
      <div className="submission-list-wrapper">
        {/*<section>*/}
        {/*  <h1 className="current-location">*/}
        {/*    <i className="icon ion-ios-list pr-3" />*/}
        {/*    My Submissions*/}
        {/*  </h1>*/}
        {/*</section>*/}
        {/*<Button variant="primary" onClick={this.handleShow}>*/}
        {/*  Launch demo modal*/}
        {/*</Button>*/}
        <Collapse
          in={this.props.showSaveSuccess}
          // in={true}
        >
          {/*<div className="container">*/}
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
          {/*</div>*/}
        </Collapse>

        {/*<Modal*/}
        {/*  show={this.props.showSaveSuccess}*/}
        {/*  // show={true}*/}
        {/*  onHide={this.props.closeSaveSuccess}*/}
        {/*  backdrop={true}*/}
        {/*  centered*/}
        {/*>*/}

        {/*  <Modal.Header closeButton>*/}
        {/*    <Modal.Title>Successfully saved !</Modal.Title>*/}
        {/*  </Modal.Header>*/}

        {/*  /!*<Modal.Body>*!/*/}

        {/*  /!*</Modal.Body>*!/*/}

        {/*  <Modal.Footer>*/}
        {/*    <Button variant="secondary"*/}
        {/*            onClick={this.props.closeSaveSuccess}>*/}
        {/*      Close*/}
        {/*    </Button>*/}
        {/*    /!*<Button variant="primary" onClick={this.props.closeSaveSuccess}>*!/*/}
        {/*    /!*  *!/*/}
        {/*    /!*  Save Changes*!/*/}
        {/*    /!*</Button>*!/*/}
        {/*  </Modal.Footer>*/}
        {/*</Modal>*/}


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
};

const mapStateToProps = createStructuredSelector({
  // submissionList: makeSelectSubmissionList(),
  submissions: makeSelectSubmissions(),
  showSaveSuccess: makeSelectShowSaveSuccess(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchSubmissions: () => dispatch(fetchSubmissions()),
    closeSaveSuccess: () => dispatch(closeSaveSuccess()),
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

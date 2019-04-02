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

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { makeSelectSubmissions } from './selectors';
import reducer from './reducer';
import saga from './saga';
import { fetchSubmissions } from './actions';

/* eslint-disable react/prefer-stateless-function */
export class SubmissionList extends React.Component {

  componentDidMount() {
    this.props.fetchSubmissions();
  }


  render() {

    let submissionItems = this.props.submissions.map((submission, index) => {
      return <li key={index} className="list-group-item">
        <a className="row no-gutters" href="#">
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
            <a href="#" className="h-100 d-inline-block pr-4 pl-4"><i
              className="icon ion-md-create" />Edit</a>
            <a href="#" className="h-100 d-inline-block"><i
              className="icon ion-md-trash" />Delete</a>
            {/*<span className="ti-pencil"></span>Edit*/}
            {/*<span></span>*/}
          </div>
          {/*{submission.broker_submission_id}*/}
        </a>
      </li>;
    });

    console.log('render SubmissionList');
    console.log(this.props);
    console.log(submissionItems.length);
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

        <h1 className="current-location"><i
          className="icon ion-ios-list pr-3" />My Submissions</h1>
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
};

const mapStateToProps = createStructuredSelector({
  // submissionList: makeSelectSubmissionList(),
  submissions: makeSelectSubmissions(),
});

function mapDispatchToProps(dispatch) {
  return {
    fetchSubmissions: () => dispatch(fetchSubmissions()),
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

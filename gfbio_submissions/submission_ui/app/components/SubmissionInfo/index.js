/**
 *
 * SubmissionInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { JIRA_ROOT } from '../../globalConstants';

// import styled from 'styled-components';

function SubmissionInfo(props) {
  if (props.brokerSubmissionId.length > 0) {
    return (
      <div className="">
        <header className="header header-left form-header-top">
          <h2 className="section-title">Info</h2>
          <p className="section-subtitle" />
        </header>
        <div className="submission-info">
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              <a href={''}>
                <i className="fa fa-bookmark-o" aria-hidden="true"></i>Broker Submission Id: <br />
                <div className="bsi">{props.brokerSubmissionId}</div>
              </a>
            </li>
            <li className="list-group-item">
              <a href={JIRA_ROOT + props.issue}>
                <i className="fa fa-tags" aria-hidden="true"></i>Helpdesk
                Key:<br />
                <div className="bsi">{props.issue}</div>
              </a>
            </li>
          </ul>


        </div>
      </div>
    );
  }
  return null;
}

SubmissionInfo.propTypes = {
  brokerSubmissionId: PropTypes.string,
  issue: PropTypes.string,
};

export default SubmissionInfo;

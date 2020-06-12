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
  const listItems = [];
  const mailToLink = `mailto:info@gfbio.org?subject=Help with Submission ${
    props.brokerSubmissionId
  }&body=Dear GFBio Team,`;
  if (props.brokerSubmissionId.length > 0) {
    listItems.push([
      <li className="list-group-item">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a>
          <i className="fa fa-bookmark-o" aria-hidden="true" />
          Submission Id: <br />
          <div className="bsi">{props.brokerSubmissionId}</div>
        </a>
      </li>,
    ]);
  }

  if (props.accessionId && props.accessionId.length > 0) {
    listItems.push(
      <div>
        <i className="fa fa-archive" aria-hidden="true" />
        ENA Accession:
        <br />
      </div>,
    );
    props.accessionId.forEach(accession => {
      listItems.push(
        <li className="list-group-item">
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a>
            <div className="bsi">
              <span style={{ fontWeight: 600 }}>ID</span>: {accession.pid}
            </div>
            <div className="bsi" style={{ marginTop: 0 }}>
              <span style={{ fontWeight: 600 }}>Status</span>:{' '}
              {accession.status}
            </div>
          </a>
        </li>,
      );
    });
  }

  if (props.issue.length > 0) {
    listItems.push(
      <li className="list-group-item">
        <a
          target="_blank"
          rel="noopener noreferrer"
          className="external"
          href={JIRA_ROOT + props.issue}
        >
          <i className="fa fa-tags" aria-hidden="true" />
          Ticket:
          <br />
          <div className="bsi">{props.issue}</div>
        </a>
      </li>,
    );
  }

  // Add closed info text
  if (props.readOnly) {
    listItems.push(
      <li className="list-group-item">
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <a>
          <i className="fa fa-info-circle" aria-hidden="true" />
          Status: <br />
          <div className="bsi">
            Your data was already archived and only the embargo date can be
            changed. If you need to make other changes, please contact our team
            by replying to the corresponding Helpdesk ticket.
          </div>
        </a>
      </li>,
    );
  }

  // Add Help link at the bottom of the box
  listItems.push(
    <li className="list-group-item">
      <a href={mailToLink} className="external">
        <i className="fa fa-comments" aria-hidden="true" />
        Do you need Help ?
      </a>
    </li>,
  );

  return (
    <div className="">
      <header className="header header-left form-header-top">
        <h2 className="section-title">Info</h2>
        <p className="section-subtitle" />
      </header>
      <div className="submission-info">
        <ul className="list-group list-group-flush">{listItems}</ul>
      </div>
    </div>
  );
  // return null;
}

SubmissionInfo.propTypes = {
  brokerSubmissionId: PropTypes.string,
  accessionId: PropTypes.array,
  issue: PropTypes.string,
  readOnly: PropTypes.bool,
};

export default SubmissionInfo;

/**
 *
 * SubmissionInfo
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// import styled from 'styled-components';

function SubmissionInfo(props) {
  if (props.brokerSubmissionId.length > 0) {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Info</h2>
          <p className="section-subtitle" />
        </header>
        <div className="">
          <a href={''}>{props.brokerSubmissionId}</a>
        </div>
      </div>
    );
  }
  return null;
}

SubmissionInfo.propTypes = {
  brokerSubmissionId: PropTypes.string,
};

export default SubmissionInfo;

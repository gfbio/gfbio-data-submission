/**
 *
 * TemplateLinkList
 *
 */

import React from 'react';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class TemplateLinkList extends React.PureComponent {
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">
            Metadata <br /> Templates
            <OverlayTrigger
              placement="right"
              overlay={
                <Tooltip id="tooltip-right" className="text-left">
                  Using a metadata template is optional, but highly recommended.
                  You can modify the existing templates to your needs.
                </Tooltip>
              }
            >
              <span className="upload-header">
                <i
                  className="icon ion-ios-help-circle-outline help align-bottom ml-2"
                  aria-hidden="true"></i>
              </span>
            </OverlayTrigger>
          </h2>

        </header>
        <div className="form-group list-group template-links">
          <a
            href="https://submissions.gfbio.org/ui/molecular/full_template.csv"
            className="list-group-item list-group-item-action"
            target="_blank"
          >
            <i className="icon ion-md-download" />
            Molecular Data
          </a>
          <a
            href="https://gfbio.biowikifarm.net/wiki/Data_submission_forms_for_occurrence_data"
            className="list-group-item list-group-item-action"
            target="_blank"
          >
            <i className="icon ion-md-download" />
            Occurrence Data
          </a>
          <a
            href="https://gfbio.biowikifarm.net/wiki/Data_submission_forms_for_the_deposit_of_biological_and_environmental_samples"
            className="list-group-item list-group-item-action"
            target="_blank"
          >
            <i className="icon ion-md-download" />
            Environmental Sample Data
          </a>
        </div>
      </div>
    );
  }
}

TemplateLinkList.propTypes = {};

export default TemplateLinkList;

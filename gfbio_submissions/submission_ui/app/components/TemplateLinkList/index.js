/**
 *
 * TemplateLinkList
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class TemplateLinkList extends React.PureComponent {
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Metadata Templates</h2>
        </header>
        <div class="form-group list-group template-links">
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

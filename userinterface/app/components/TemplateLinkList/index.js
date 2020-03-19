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
    const metadata_data_title = {
      padding: '5px',
      marginBottom: '0'
    };
    const metadata_data_last_title = {
      padding: '5px',
      marginBottom: '0',
      marginTop: '15px',
    };
    const no_border = {
      borderBottom: 'none',
      borderBottomWidth: '0',
      paddingBottom: '0',
    }
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title metadata-templates">
            Metadata Templates
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
          
          <h5 style={metadata_data_title}>Molecular Data Template:</h5>
          <div>
            <a
              href="https://gitlab.gwdg.de/gfbio/molecular-submission-templates/-/raw/master/full_template.csv?inline=false"
              className="list-group-item list-group-item-action metadata-link"
              target="_blank"
              style={no_border}
              download="download"
            >
              <i className="icon ion-md-download" />
              CSV Template
            </a>
            
            <a
              href="https://gitlab.gwdg.de/gfbio/molecular-submission-templates/-/wikis/Template-Description"
              className="list-group-item list-group-item-action metadata-link"
              target="_blank"
              style={no_border}
            >
              <i className="icon ion-md-book" />
              Template Description
            </a>
          </div>
          
          <h5 style={metadata_data_last_title}>Biodiversity, Ecological and Collection Data Template:</h5>
            <div>
              <a
                href="https://species-id.net/o/media/1/1d/GFBio_data_submission_template.zip"
                className="list-group-item list-group-item-action metadata-link"
                target="_blank"
                style={no_border}
              >
                <i className="icon ion-md-download" />
                CSV Template
              </a>

              <a
              href="https://gfbio.biowikifarm.net/wiki/Data_submission_templates_for_biodiversity,_ecological_and_collection_data"
              className="list-group-item list-group-item-action metadata-link"
              target="_blank"
              style={no_border}
            >
              <i className="icon ion-md-book" />
              Template Description
            </a>
            </div>
          {/*<a*/}
          {/*  href="https://gfbio.biowikifarm.net/wiki/Data_submission_forms_for_occurrence_data"*/}
          {/*  className="list-group-item list-group-item-action"*/}
          {/*  target="_blank"*/}
          {/*>*/}
          {/*  <i className="icon ion-md-download" />*/}
          {/*  Occurrence Data*/}
          {/*</a>*/}
          {/*<a*/}
          {/*  href="https://gfbio.biowikifarm.net/wiki/Data_submission_forms_for_the_deposit_of_biological_and_environmental_samples"*/}
          {/*  className="list-group-item list-group-item-action"*/}
          {/*  target="_blank"*/}
          {/*>*/}
          {/*  <i className="icon ion-md-download" />*/}
          {/*  Environmental Sample Data*/}
          {/*</a>*/}
        </div>
      </div>
    );
  }
}

TemplateLinkList.propTypes = {};

export default TemplateLinkList;

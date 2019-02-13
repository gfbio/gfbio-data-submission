/**
 *
 * MetaDataSchemaForm
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class MetaDataSchemaForm extends React.PureComponent {
  schemaList = [
    'None',
    'ABCD 2.06',
    'DwC 2013-10-25',
    'DC 1.1',
    'EDM 5.2.3',
    'EML 2.1.1',
    'ESE 3.4.1',
    'INSPIRE Directive 2007/2/EC',
    'ISO 19115-1 2014',
    'GPLv2',
    'MIxS 4.0',
  ];

  schemaListElements = this.schemaList.map(schema => (
    <li className="list-group-item" key={schema.replace(/ /g, '')}>
      <button
        className="btn btn-primary btn-block btn-license text-left"
        type="button"
        data-toggle="collapse"
        data-target="#collapseMetaData"
        aria-expanded="false"
        aria-controls="collapseMetaData"
      >
        {schema}
        <a className="license-link align-bottom" href={`edit_${schema}`}>
          details
        </a>
      </button>
    </li>
  ));

  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Metadata Schema</h2>
          <p className="section-subtitle" />
        </header>
        <div className="form-group accordion-form-content">
          <button
            className="btn btn-primary btn-block btn-license text-left"
            type="button"
            data-toggle="collapse"
            data-target="#collapseMetaData"
            aria-expanded="false"
            aria-controls="collapseMetaData"
          >
            <i className="fa fa-code" />
            None
            <p className="align-bottom">
              change
            </p>
          </button>

          <div className="collapse" id="collapseMetaData">
            <div className="card card-body">
              <ul className="list-group">{this.schemaListElements}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MetaDataSchemaForm.propTypes = {};

export default MetaDataSchemaForm;

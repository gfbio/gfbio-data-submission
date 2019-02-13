/**
 *
 * LicenseSelectionForm
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class LicenseSelectionForm extends React.PureComponent {
  licenseList = [
    'CC0 1.0',
    'CC BY 4.0',
    'CC BY NC 3.0',
    'MIT',
    'Apache-2.0',
    'BSD 3-clause',
    'BSD 2-clause',
    'GPLv3',
    'GPLv2',
    'LGPL',
    'MPL-2.0',
    'CeCILL',
    'CeCILL-B',
    'CERN OHL',
    'TAPR OHL',
  ];

  licenseListElements = this.licenseList.map(license => (
    <li className="list-group-item" key={license.replace(/ /g, '')}>
      <button
        className="btn btn-primary btn-block btn-license text-left"
        type="button"
        data-toggle="collapse"
        data-target="#collapseLicense"
        aria-expanded="false"
        aria-controls="collapseLicense"
      >
        {license}
        <a className="align-bottom" href={`edit_${license}`}>
          details
        </a>
      </button>
    </li>
  ));

  // TODO:  Maybe a connection to store/reducer is needed
  // TODO: no redux form connection ? set license to form with reeducer ?
  // TODO: get List of Licenses dynamically
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">License</h2>
          <p className="section-subtitle" />
        </header>

        <div className="form-group accordion-form-content">
          <button
            className="btn btn-primary btn-block btn-license text-left"
            type="button"
            data-toggle="collapse"
            data-target="#collapseLicense"
            aria-expanded="false"
            aria-controls="collapseLicense"
          >
            <i className="fa fa-balance-scale" />
            CC BY 4.0
            <p className="align-bottom" href="EDIT_LICENSE">
              change
            </p>
          </button>

          <div className="collapse" id="collapseLicense">
            <div className="card card-body">
              <ul className="list-group">{this.licenseListElements}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

LicenseSelectionForm.propTypes = {};

export default LicenseSelectionForm;

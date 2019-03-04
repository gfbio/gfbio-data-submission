/**
 *
 * LicenseSelectionForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import injectReducer from 'utils/injectReducer';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import reducer from '../../containers/SubmissionForm/reducer';
import { makeSelectLicense } from '../../containers/SubmissionForm/selectors';
import { changeLicense } from '../../containers/SubmissionForm/actions';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class LicenseSelectionForm extends React.PureComponent {
  licenseList = [
    'CC0 1.0',
    'CC BY 4.0',
    'CC BY NC 4.0',
    'CC BY-NC-ND 4.0',
    'CC BY-NC-SA 4.0',
    'CC BY-ND 4.0',
    'CC BY-SA 4.0',
    'Other License',
  ];

  licenseListElements = this.licenseList.map(license => (
    <li className="list-group-item" key={license.replace(/ /g, '')}>
      <button
        className="btn btn-primary btn-block btn-license text-left"
        type="button"
        data-toggle="collapse show"
        data-target="#collapseLicense"
        aria-expanded="false"
        aria-controls="collapseLicense"
        onClick={() => this.props.onClickLicense(license)}
      >
        {license}
        <a className="align-bottom" href={`link_to_details_of_${license}`}>
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
            {this.props.license}
            <p className="align-bottom">change</p>
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

LicenseSelectionForm.propTypes = {
  onClickLicense: PropTypes.func,
  license: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  license: makeSelectLicense(),
});

function mapDispatchToProps(dispatch) {
  return {
    onClickLicense: license => dispatch(changeLicense(license)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);
const withReducer = injectReducer({ key: 'submissionForm', reducer });

export default compose(
  withReducer,
  withConnect,
)(LicenseSelectionForm);

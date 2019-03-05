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
        <a className="align-bottom" data-toggle="modal"
           data-target="#exampleModalCenter">
          details
        </a>
        {/*<a type="button" className="align-bottom btn btn-license-detail"*/}
        {/*data-toggle="modal"*/}
        {/*data-target="#exampleModalCenter">*/}
        {/*details*/}
        {/*</a>*/}
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
        {/* MODAL*/}
        <div className="modal fade" id="exampleModalCenter" tabIndex="-1"
             role="dialog" aria-labelledby="exampleModalCenterTitle"
             aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title" id="exampleModalCenterTitle">
                  'Licensen Name' Decription
                </h4>
                <button type="button" className="close" data-dismiss="modal"
                        aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <h6>What does this mean?</h6>
                <p>
                  This dataset is licensed under a Creative Commons Attribution
                  4.0 International licence. What does this mean? You can share,
                  copy and modify this dataset so long as you give appropriate
                  credit, provide a link to the CC BY license, and indicate if
                  changes were made, but you may not do so in a way that
                  suggests the rights holder has endorsed you or your use of the
                  dataset. Note that further permission may be required for any
                  content within the dataset that is identified as belonging to
                  a third party.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                  data-dismiss="modal"
                >Read More
                </button>

                <button
                  className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                  data-dismiss="modal"
                >Choose this License
                </button>

                {/*<button type="button" className="btn btn-secondary"*/}
                {/*data-dismiss="modal">Close*/}
                {/*</button>*/}
                {/*<button type="button" className="btn btn-primary">Save changes*/}
                {/*</button>*/}
              </div>
            </div>
          </div>
        </div>
        {/* END MODAL*/}

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

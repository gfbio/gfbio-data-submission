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
import {
  makeSelectLicense,
  makeSelectLicenseKey,
} from '../../containers/SubmissionForm/selectors';
import { changeLicense } from '../../containers/SubmissionForm/actions';
import { licenseDetailData, licenseModals } from './licenseDetailsData';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class LicenseSelectionForm extends React.PureComponent {
  // licenseList = [
  //   'CC0 1.0',
  //   'CC BY 4.0',
  //   'CC BY NC 4.0',
  //   'CC BY-NC-ND 4.0',
  //   'CC BY-NC-SA 4.0',
  //   'CC BY-ND 4.0',
  //   'CC BY-SA 4.0',
  //   'Other License',
  // ];

  licenseListElements = Object.keys(licenseDetailData).map(licenseKey => (
    <li className="list-group-item" key={licenseKey}>
      <button
        className="btn btn-primary btn-block btn-license text-left"
        type="button"
        data-toggle="collapse show"
        data-target="#collapseLicense"
        aria-expanded="false"
        aria-controls="collapseLicense"
        onClick={() => this.props.onClickLicense(licenseDetailData[licenseKey].name, licenseKey)}
      >
        {licenseDetailData[licenseKey].name}
        <a className="align-bottom" data-toggle="modal"
           data-target={'#' + licenseKey}>
          details
        </a>
      </button>
    </li>
  ));

  // TODO:  Maybe a connection to store/reducer is needed
  // TODO: no redux form connection ? set license to form with reeducer ?
  // TODO: get List of Licenses dynamically
  render() {
    console.log('LicenseSelectionForm render');
    console.log(this.props);
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">License</h2>
          <p className="section-subtitle" />
        </header>
        {/* MODAL*/}
        {/*<div className="modal fade" id={this.props.licenseKey} tabIndex="-1"*/}
        {/*role="dialog" aria-labelledby="exampleModalCenterTitle"*/}
        {/*aria-hidden="true">*/}
        {/*<div className="modal-dialog modal-dialog-centered modal-lg"*/}
        {/*role="document">*/}
        {/*<div className="modal-content">*/}
        {/*<div className="modal-header">*/}
        {/*<h4 className="modal-title" id="exampleModalCenterTitle">*/}
        {/*'Licensen Name' Decription*/}
        {/*</h4>*/}
        {/*<button type="button" className="close" data-dismiss="modal"*/}
        {/*aria-label="Close">*/}
        {/*<span aria-hidden="true">&times;</span>*/}
        {/*</button>*/}
        {/*</div>*/}
        {/*<div className="modal-body">*/}
        {/*<h5>What does this mean?</h5>*/}
        {/*<p>*/}
        {/*{licenseDetailData[this.props.licenseKey].shortDescription}*/}
        {/*</p>*/}
        {/*</div>*/}
        {/*<div className="modal-footer">*/}
        {/*<a*/}
        {/*className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"*/}
        {/*data-dismiss="modal"*/}
        {/*href={licenseDetailData[this.props.licenseKey].link}*/}
        {/*>Read More*/}
        {/*</a>*/}

        {/*<button*/}
        {/*className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"*/}
        {/*data-dismiss="modal"*/}
        {/*>Choose this License*/}
        {/*</button>*/}

        {/*/!*<button type="button" className="btn btn-secondary"*!/*/}
        {/*/!*data-dismiss="modal">Close*!/*/}
        {/*/!*</button>*!/*/}
        {/*/!*<button type="button" className="btn btn-primary">Save changes*!/*/}
        {/*/!*</button>*!/*/}
        {/*</div>*/}
        {/*</div>*/}
        {/*</div>*/}
        {/*</div>*/}
        {licenseModals}
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

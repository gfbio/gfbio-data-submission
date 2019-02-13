/**
 *
 * FormWrapper
 *
 */

import React from 'react';
import { reduxForm } from 'redux-form/immutable';
import PropTypes from 'prop-types';
import MinimalSubmissionForm from 'components/MinimalSubmissionForm';
import ContributersForm from '../ContributersForm';
import TargetDataCenterForm from '../TargetDataCenterForm';
import DataCategoryForm from '../DataCategoryForm';
import CommentForm from '../CommentForm';
import LicenseSelectionForm from '../LicenseSelectionForm';
import LegalRequirementsForm from '../LegalRequirementsForm';
import MetaDataSchemaForm from '../MetaDataSchemaForm';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class FormWrapper extends React.PureComponent {
  render() {
    return (
      <form
        name="wrapping-form"
        className="pagewide-form"
        onSubmit={this.props.handleSubmit}
      >
        <div className="container">
          <div className="row">
            <div className="col-md-9">
              {/* left col */}
              <h2>Left col</h2>

              <MinimalSubmissionForm />

              <ContributersForm />

              <TargetDataCenterForm />

              <DataCategoryForm />

              <CommentForm />

              {/* TODO: candidate for extra component (function) for modularity */}
              <div className="form-row mt-5">
                <div className="form-group col-md-4">
                  <button
                    className="btn btn-secondary btn-block btn-light-blue">
                    <i className="fa fa-clipboard" />
                    Save
                  </button>
                </div>
                <div className="form-group col-md-4">
                  <button
                    className="btn btn-secondary btn-block btn-light-blue">
                    <i className="fa fa-calendar" />
                    Set Embargo
                  </button>
                </div>
                <div className="form-group col-md-4">
                  <button
                    type="submit"
                    className="btn btn-secondary btn-block green"
                  >
                    <i className="fa fa-play" />
                    Submit
                  </button>
                </div>
              </div>
            </div>
            {/* end left col */}
            <div className="col-md-3">
              {/* right col */}
              <h2>Right Col</h2>

              <LicenseSelectionForm />

              <LegalRequirementsForm />

              <MetaDataSchemaForm />

            </div>
            {/* end right col */}
          </div>
        </div>
      </form>
    );
  }
}

FormWrapper.propTypes = {
  handleSubmit: PropTypes.func,
};

export default reduxForm({ form: 'formWrapper' })(FormWrapper);

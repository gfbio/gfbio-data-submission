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
import SubmitFormSection from '../SubmitFormSection';
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

              <MinimalSubmissionForm />

              <ContributersForm />

              <TargetDataCenterForm />

              <DataCategoryForm />

              <CommentForm />
            </div>
            {/* end left col */}
            <div className="col-md-3">
              {/* right col */}

              <LicenseSelectionForm />

              <LegalRequirementsForm />

              <MetaDataSchemaForm />
            </div>
            {/* end right col */}
          </div>

          <div className="row">
            <div className="col-md-9">
              <SubmitFormSection />
              {/* left col */}
            </div>
            <div className="col-md-3">{/* right col */}</div>
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

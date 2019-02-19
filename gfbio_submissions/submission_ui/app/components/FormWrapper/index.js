/**
 *
 * FormWrapper
 *
 */

import React from 'react';
import { reduxForm } from 'redux-form/immutable';
import PropTypes from 'prop-types';
import MinimalSubmissionForm from 'components/MinimalSubmissionForm';
import ContributersForm from 'components/ContributersForm';
import TargetDataCenterForm from 'components/TargetDataCenterForm';
import DataCategoryForm from 'components/DataCategoryForm';
import CommentForm from 'components/CommentForm';
import LicenseSelectionForm from 'components/LicenseSelectionForm';
import LegalRequirementsForm from 'components/LegalRequirementsForm';
import MetaDataSchemaForm from 'components/MetaDataSchemaForm';
import EmbargoDatePicker from 'components/EmbargoDatePicker';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class FormWrapper extends React.PureComponent {
  render() {
    let submitIconClass = 'fa-play';
    let submitButtonText = 'Submit';
    let saveIconClass = 'fa-clipboard';
    let saveButtonText = 'Save';
    if (this.props.submitInProgress) {
      submitIconClass = 'fa-cog fa-spin fa-fw';
      submitButtonText = 'submitting ...';
    }
    if (this.props.saveInProgress) {
      saveIconClass = 'fa-cog fa-spin fa-fw';
      saveButtonText = 'saving ...';
    }

    return (
      <form
        name="wrapping-form"
        className="pagewide-form"
        // onSubmit={this.props.handleSubmit}
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
              {/* left col */}

              <div className="form-row mt-5">
                <div className="form-group col-md-4">
                  <button
                    type="submit"
                    className="btn btn-secondary btn-block btn-light-blue"
                    onClick={this.props.handleSubmit(values =>
                      this.props.onSubmit({
                        ...values,
                        workflow: 'save',
                      }),
                    )}
                  >
                    <i className={`fa ${saveIconClass}`} />
                    {saveButtonText}
                  </button>
                </div>
                <div className="form-group col-md-4">
                  <EmbargoDatePicker
                    onChange={this.props.handleDateChange}
                    embargoDate={this.props.embargoDate}
                  />
                </div>
                <div className="form-group col-md-4">
                  <button
                    type="submit"
                    className="btn btn-secondary btn-block green"
                    onClick={this.props.handleSubmit(values =>
                      this.props.onSubmit({
                        ...values,
                        workflow: 'submit',
                      }),
                    )}
                  >
                    <i className={`fa ${submitIconClass}`} />
                    {submitButtonText}
                  </button>
                </div>
              </div>
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
  handleDateChange: PropTypes.func,
  embargoDate: PropTypes.instanceOf(Date),
  onSubmit: PropTypes.func,
  submitInProgress: PropTypes.bool,
  saveInProgress: PropTypes.bool,
};

export default reduxForm({ form: 'formWrapper' })(FormWrapper);

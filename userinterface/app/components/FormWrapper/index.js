/**
 *
 * FormWrapper
 *
 */

import React from 'react';
import { reduxForm } from 'redux-form/immutable';
import PropTypes from 'prop-types';
import ContributorsForm from 'components/ContributorsForm';
import TargetDataCenterForm from 'components/TargetDataCenterForm';
import DataCategoryForm from 'components/DataCategoryForm';
import CommentForm from 'components/CommentForm';
import LicenseSelectionForm from 'components/LicenseSelectionForm';
import LegalRequirementsForm from 'components/LegalRequirementsForm';
import Alert from 'react-bootstrap/Alert';
import NavigationPrompt from 'react-router-navigation-prompt';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import TemplateLinkList from '../TemplateLinkList';
import DatasetLabelForm from '../DatasetLabelForm';
import DataUrlForm from '../DataUrlForm';
import EmbargoDatePicker from '../EmbargoDatePicker';
import RelatedPublicationsForm from '../RelatedPublicationsForm';
import MinimalSubmissionForm from '../MinimalSubmissionForm';
import SubmissionInfo from '../SubmissionInfo';
import { makeSelectFormChanged } from '../../containers/SubmissionForm/selectors';
import { resetForm, setFormChanged } from '../../containers/SubmissionForm/actions';

/* eslint-disable react/prefer-stateless-function */
class FormWrapper extends React.PureComponent {
  getSyncErrors = () => {
    if (this.props.reduxFormWrapper !== undefined) {
      return this.props.reduxFormWrapper.syncErrors;
    }
    return undefined;
  };

  getFields = () => {
    if (this.props.reduxFormWrapper !== undefined) {
      return this.props.reduxFormWrapper.fields;
    }
    return undefined;
  };

  getMutualErrorMessages = () => {
    let errors = {};
    const e = this.getSyncErrors();
    let fields = {};
    const f = this.getFields();
    let errorsKeys = new Set();
    let fieldsKeys = new Set();
    if (e !== undefined && f !== undefined) {
      errors = e;
      fields = f;
      errorsKeys = new Set(Object.keys(errors));
      fieldsKeys = new Set(Object.keys(fields));
    }
    const mutual = new Set([...errorsKeys].filter(x => fieldsKeys.has(x)));
    if (this.props.generalError) {
      errors['General Form Error'] =
        'Please check the form for dedicated error messages';
      mutual.add('General Form Error');
    }
    return [mutual, errors];
  };

  prepareErrorNotification = () => {
    const mutualMessages = this.getMutualErrorMessages();
    const mutual = mutualMessages[0];
    const errors = mutualMessages[1];

    const errorList = [...mutual].map((errorKey, index) => {
      const errorName = errorKey.charAt(0).toUpperCase() + errorKey.slice(1);
      return (
        <li key={index} className="list-group-item">
          <span className="validation-error-item">
            <i className="ti-layout-line-solid icon " />
            {errorName}
            <i className="ti-arrow-right icon pl-1" />
            {errors[errorKey]}
          </span>
        </li>
      );
    });

    if (Object.keys(errors).length <= 0) {
      return null;
    }
    return (
      <Alert variant="light">
        <Alert.Heading>
          <i className="fa  fa-bolt" /> There are some validation errors
        </Alert.Heading>
        <ul className="list-group list-group-flush">
          {errorList}
          <li className="list-group-item">
            <span className="validation-error-item">
              Once all errors are resolved, try to submit again.
            </span>
          </li>
        </ul>
      </Alert>
    );
  };

  renderNavigationPrompt = () => {
    if (
      (this.props.pristine === false && this.props.promptOnLeave) ||
      this.props.formChanged
    ) {
      return (
        <NavigationPrompt when>
          {({ onConfirm, onCancel }) => (
            <Modal show onHide={onCancel} backdrop centered>
              <Modal.Header closeButton>
                <Modal.Title className="pl-4">Leave this section ?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <Row className="show-grid text-center">
                    <Col xs={12} md={12}>
                      Are you sure leaving this form ? Press 'Cancel' to stay or
                      press 'Save' to save changes before leaving. Press
                      'Discard' to leave with out saving.
                    </Col>
                  </Row>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Container>
                  <Row className="show-grid">
                    <Col xs={12} md={4}>
                      <Button
                        variant="secondary"
                        className="btn-block btn-sm green"
                        onClick={onCancel}
                      >
                        <i className="icon ion-md-close" />
                        Cancel
                      </Button>
                    </Col>
                    <Col xs={12} md={4} className="text-right">
                      <Button
                        variant="secondary"
                        className="btn-block btn-sm btn-light-blue"
                        onClick={this.props.handleSubmit(values =>
                          this.props.onSubmit({
                            ...values,
                            workflow: 'save',
                          }),
                        )}
                      >
                        <i className="icon ion-ios-save" />
                        Save
                      </Button>
                    </Col>
                    <Col xs={12} md={4} className="text-right">
                      <Button
                        variant="secondary"
                        className="btn-block btn-sm red"
                        // onClick={this.props.onDiscard}
                        onClick={e => {
                          e.preventDefault();
                          // this.props.onDiscard();
                          this.props.setFormChanged(false);
                          this.props.reset();
                          onConfirm();
                        }}
                      >
                        <i className="icon ion-md-alert" />
                        Discard
                      </Button>
                    </Col>
                  </Row>
                </Container>
              </Modal.Footer>
            </Modal>
          )}
        </NavigationPrompt>
      );
    }
    return null;
  };

  render() {
    console.info('RENDER FORMWRAPER');
    console.info(this.props);

    let submitIconClass = 'fa-play';
    let submitButtonText = 'Start Submission';
    let saveIconClass = 'fa-clipboard';
    let saveButtonText = 'Save Draft';

    if (this.props.brokerSubmissionId !== '') {
      submitButtonText = 'Update Submission';
      submitIconClass = 'fa fa-forward';
    }

    if (this.props.isClosed) {
      submitButtonText = 'Update Embargo';
      submitIconClass = 'fa fa-forward';
    }

    if (this.props.submitInProgress) {
      submitIconClass = 'fa-cog fa-spin fa-fw';
      submitButtonText = 'submitting ...';
    }
    if (this.props.saveInProgress) {
      saveIconClass = 'fa-cog fa-spin fa-fw';
      saveButtonText = 'saving ...';
    }

    const errors = this.prepareErrorNotification();

    return (
      <form
        name="wrapping-form"
        className="pagewide-form"
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <div className="container">
          <div className="row">
            {/* <div className="col-md-1"> */}
            {/* left col */}
            {/* TODO: https://getbootstrap.com/docs/4.0/examples/dashboard/ */}

            {/* TODO: sticky left side bar. Or on the right ? */}
            {/* <div className="sticky-top sidebar"> */}
            {/*  <header className="header header-left form-header-top"> */}
            {/*    <h2 className="section-title"></h2> */}
            {/*    <p className="section-subtitle" /> */}
            {/*  </header> */}
            {/*  <p>lorem ipsum ...</p> */}
            {/* </div> */}

            {/* </div> */}
            {/* left col */}
            <div className="col-md-9 form-col">
              {/* middle col */}

              {this.renderNavigationPrompt()}

              <MinimalSubmissionForm readOnly={this.props.isClosed} />

              <DataUrlForm readOnly={this.props.isClosed} />

              <ContributorsForm readOnly={this.props.isClosed} />

              <TargetDataCenterForm readOnly={this.props.isClosed} />

              <DataCategoryForm readOnly={this.props.isClosed} />

              <DatasetLabelForm readOnly={this.props.isClosed} />

              <RelatedPublicationsForm readOnly={this.props.isClosed} />

              <CommentForm readOnly={this.props.isClosed} />
            </div>
            {/* end middle col */}
            <div className="col-md-3 sidebar-col">
              {/* right col */}

              <SubmissionInfo
                brokerSubmissionId={this.props.brokerSubmissionId}
                accessionId={this.props.accessionId}
                readOnly={this.props.isClosed}
                issue={this.props.issue}
              />

              <LicenseSelectionForm readOnly={this.props.isClosed} />

              <LegalRequirementsForm readOnly={this.props.isClosed} />

              <TemplateLinkList />

              {/* <MetaDataSchemaForm /> */}

              <EmbargoDatePicker accessionId={this.props.accessionId} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-9 form-footer">
              {/* middle col */}
              <div className="form-row">
                <div className="form-group col-md-12">{errors}</div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-12">
                  {/* {errors} */}
                  {this.props.saveSuccessMessage}
                  {this.props.submitErrorMessage}
                </div>
              </div>

              <div className="form-row mt-5">
                {/* TODO: commented to hide save button as defined in GFBIO-2584 */}
                {/* <div className="form-group col-md-6"> */}
                {/*  <button */}
                {/*    type="submit" */}
                {/*    className="btn btn-secondary btn-block btn-light-blue" */}
                {/*    onClick={this.props.handleSubmit(values => */}
                {/*      this.props.onSubmit({ */}
                {/*        ...values, */}
                {/*        workflow: 'save', */}
                {/*      }), */}
                {/*    )} */}
                {/*  > */}
                {/*    <i className={`fa ${saveIconClass}`} /> */}
                {/*    {saveButtonText} */}
                {/*  </button> */}
                {/* </div> */}

                {/* <div className="form-group col-md-4"> */}

                {/* </div> */}
                <div className="form-group col-md-12">
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
  onSubmit: PropTypes.func,
  submitInProgress: PropTypes.bool,
  saveInProgress: PropTypes.bool,
  profile: PropTypes.object,
  reduxFormWrapper: PropTypes.object,
  promptOnLeave: PropTypes.bool,
  generalError: PropTypes.bool,
  saveSuccessMessage: PropTypes.object,
  submitErrorMessage: PropTypes.object,
  brokerSubmissionId: PropTypes.string,
  accessionId: PropTypes.array,
  issue: PropTypes.string,
  formChanged: PropTypes.bool,
  reset: PropTypes.func,
  isClosed: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  formChanged: makeSelectFormChanged(),
});

const mapDispatchToProps = dispatch => ({
  setFormChanged: changed => dispatch(setFormChanged(changed)),
  reset: () => dispatch(resetForm()),
});

FormWrapper = connect(
  mapStateToProps,
  mapDispatchToProps,
)(FormWrapper);
// this is already connected to redux-form reducer ?

// initialValues: {title: 'Preset'} -> is set to form values once form is touched but not shown in browser
FormWrapper = reduxForm({
  form: 'formWrapper',
  enableReinitialize: true,
})(FormWrapper);
export default FormWrapper;

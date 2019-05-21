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
import MetaDataSchemaForm from 'components/MetaDataSchemaForm';
import MinimalSubmissionForm from '../MinimalSubmissionForm';
import RelatedPublicationsForm from '../RelatedPublicationsForm';
import EmbargoDatePicker from '../EmbargoDatePicker';
import DataUrlForm from '../DataUrlForm';
import DatasetLabelForm from '../DatasetLabelForm';
import TemplateLinkList from '../TemplateLinkList';
import Alert from 'react-bootstrap/Alert';
import NavigationPrompt from 'react-router-navigation-prompt';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

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

  prepareErrorNotification = () => {
    let errors = this.getSyncErrors();
    let fields = this.getFields();
    if (errors !== undefined && fields !== undefined) {
      let errorsKeys = new Set(Object.keys(errors));
      let fieldsKeys = new Set(Object.keys(fields));
      let mutual = new Set([...errorsKeys].filter(x => fieldsKeys.has(x)));
      let errorList = [...mutual].map((errorKey, index) => {
        return (
          <li key={index} className="list-group-item">
            <span className="validation-error-item">
              <i className="ti-layout-line-solid icon " />
              {errorKey}
              <i className="ti-arrow-right icon pl-1" />
              {errors[errorKey]}
            </span>
          </li>
        );
      });
      return (
        <Alert variant="light">
          <Alert.Heading><i className="fa  fa-bolt" /> There are some validation
            errors you need to take care of</Alert.Heading>
          <ul className="list-group list-group-flush">
            {errorList}
            <li className="list-group-item">
              <span className="validation-error-item">
                Once all errors are resolved, try to 'save' or 'start' again.
              </span>
            </li>
          </ul>
        </Alert>
      );
    } else {
      return null;
    }
  };

  renderNavigationPrompt = () => {
    // if (this.props.saveInProgress || this.props.submitInProgress) {
    //   return (<Modal
    //     show={true}
    //     centered
    //   >
    //     <Modal.Header>
    //       <Modal.Title className="pl-4">Processing ...</Modal.Title>
    //     </Modal.Header>
    //     <Modal.Body>
    //       <Container>
    //         <Row className="show-grid text-center">
    //           <Col xs={12} md={12}>
    //             <i className="fa fa-cog fa-spin fa-fw fa-lg" />
    //           </Col>
    //         </Row>
    //       </Container>
    //     </Modal.Body>
    //   </Modal>);
    // } else
    if (this.props.pristine === false && this.props.promptOnLeave) {
      return (
        <NavigationPrompt when={true}>
          {({ onConfirm, onCancel }) => (
            <Modal
              show={true}
              onHide={onCancel}
              backdrop={true}
              centered
            >
              <Modal.Header closeButton>
                <Modal.Title className="pl-4">Leave this section ?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <Row className="show-grid text-center">
                    <Col xs={12} md={12}>
                      Are you sure leaving this form ? Press 'Cancel' to stay
                      or press 'Save' to save changes before leaving.
                      Press 'Discard' to leave with out saving.
                    </Col>
                  </Row>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Container>
                  <Row className="show-grid">
                    <Col xs={12} md={4}>
                      <Button variant="secondary"
                              className="btn-block btn-sm green"
                              onClick={onCancel}>
                        <i className="icon ion-md-close" />
                        Cancel
                      </Button>
                    </Col>
                    <Col xs={12} md={4} className="text-right">
                      <Button variant="secondary"
                              className="btn-block btn-sm btn-light-blue"
                              onClick={this.props.handleSubmit(values =>
                                this.props.onSubmit({
                                  ...values,
                                  workflow: 'save',
                                }),
                              )}>
                        <i className="icon ion-ios-save" />
                        Save
                      </Button>
                    </Col>
                    <Col xs={12} md={4} className="text-right">
                      <Button variant="secondary"
                              className="btn-block btn-sm red"
                        // onClick={this.props.onDiscard}
                              onClick={
                                e => {
                                  e.preventDefault();
                                  // this.props.onDiscard();
                                  this.props.reset();
                                  onConfirm();
                                }
                              }
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
    } else {
      return null;
    }
  };

  render() {
    let submitIconClass = 'fa-play';
    let submitButtonText = 'Start Submission';
    let saveIconClass = 'fa-clipboard';
    let saveButtonText = 'Save Draft';
    if (this.props.submitInProgress) {
      submitIconClass = 'fa-cog fa-spin fa-fw';
      submitButtonText = 'submitting ...';
    }
    if (this.props.saveInProgress) {
      saveIconClass = 'fa-cog fa-spin fa-fw';
      saveButtonText = 'saving ...';
    }
    let errors = this.prepareErrorNotification();

    console.log('--------------render FormWrapper');
    console.log(this.props);
    console.log('###############################');

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
            {/*<div className="col-md-2">*/}
            {/* left col */}
            {/* TODO: https://getbootstrap.com/docs/4.0/examples/dashboard/ */}

            {/* TODO: sticky left side bar. Or on the right ? */}
            {/*<div className="sticky-top sidebar">*/}
            {/*  <header className="header header-left form-header-top">*/}
            {/*    <h2 className="section-title"></h2>*/}
            {/*    <p className="section-subtitle" />*/}
            {/*  </header>*/}
            {/*  <p>lorem ipsum ...</p>*/}
            {/*</div>*/}

            {/*</div>*/}
            {/* left col */}
            <div className="col-md-9">
              {/* middle col */}

              {this.renderNavigationPrompt()}

              <MinimalSubmissionForm />

              <DataUrlForm />

              <ContributorsForm />

              <TargetDataCenterForm />

              <DataCategoryForm />

              <DatasetLabelForm />

              <RelatedPublicationsForm />

              <CommentForm />

            </div>
            {/* end middle col */}
            <div className="col-md-3">
              {/* right col */}

              <LicenseSelectionForm />

              <LegalRequirementsForm />

              <TemplateLinkList />

              <MetaDataSchemaForm />

              <EmbargoDatePicker
                onChange={this.props.handleDateChange}
                embargoDate={this.props.embargoDate}
              />
            </div>
          </div>

          <div className="row">

            <div className="col-md-9">
              {/* middle col */}
              <div className="form-row">
                <div className="form-group col-md-12">
                  {errors}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-md-12">
                  {/*{errors}*/}
                  {this.props.saveSuccessMessage}
                </div>
              </div>

              <div className="form-row mt-5">
                <div className="form-group col-md-6">
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
                {/*<div className="form-group col-md-4">*/}

                {/*</div>*/}
                <div className="form-group col-md-6">
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
  handleDateChange: PropTypes.func,
  embargoDate: PropTypes.instanceOf(Date),
  onSubmit: PropTypes.func,
  submitInProgress: PropTypes.bool,
  saveInProgress: PropTypes.bool,
  profile: PropTypes.object,
  reduxFormWrapper: PropTypes.object,
  promptOnLeave: PropTypes.bool,
  saveSuccessMessage: PropTypes.object,
};

// this is already connected to redux-form reducer ?

// initialValues: {title: 'Preset'} -> is set to form values once form is touched but not shown in browser
FormWrapper = reduxForm({
  form: 'formWrapper',
  enableReinitialize: true,
})(FormWrapper);
export default FormWrapper;

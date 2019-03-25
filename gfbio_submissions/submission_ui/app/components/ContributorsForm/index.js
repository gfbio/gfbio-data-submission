/**
 *
 * ContributorsForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectContributors,
  makeSelectCurrentContributor,
} from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
  addContributor,
  changeContributor,
  updateContributor,
  updateCurrentContributor,
} from '../../containers/SubmissionForm/actions';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

/* eslint-disable react/prefer-stateless-function */
class ContributorsForm extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      institution: '',
      contribution: '',
      formValues: {},
      contribs: [],
      current: {},
      formOpen: false,
      detailOpen: false,
      contributorIndex: -1,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeFirstName = this.handleChangeFirstName.bind(this);
    this.handleChangeLastName = this.handleChangeLastName.bind(this);
    this.handleChangeEmailAddress = this.handleChangeEmailAddress.bind(this);
    this.handleChangeInstitution = this.handleChangeInstitution.bind(this);
    this.handleChangeContribution = this.handleChangeContribution.bind(this);
  }

  validateFormValues(formValues) {
    let isValid = true;
    // let formValues = this.state.formValues;
    if (!formValues['firstName']) {
      // console.log('validateFormValues no fn');
      isValid = false;
    }
    // if (typeof formValues['firstName'] !== 'undefined') {
    //   console.log('validateFormValues fn unde or regex');
    //   if (!formValues['firstName'].match(/^[a-zA-Z]+$/)) {
    //     isValid = false;
    //   }
    // }
    if (!formValues['lastName']) {
      // console.log('validateFormValues no ln');
      isValid = false;
    }
    // if (typeof formValues['lastName'] !== 'undefined') {
    //   console.log('validateFormValues ln undef or regex');
    //   if (!formValues['lastName'].match(/^[a-zA-Z]+$/)) {
    //     isValid = false;
    //   }
    // }
    if (!formValues['emailAddress']) {
      // console.log('validateFormValues no email');
      isValid = false;
    }

    // if (typeof formValues['emailAddress'] !== 'undefined') {
    //   const pattern = /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
    //   const result = pattern.test(formValues['emailAddress']);
    //   if (result === false) {
    //     console.log('validateFormValues email regex');
    //     isValid = false;
    //   }
    // }
    // console.log('validateFormValues will return: ' + isValid);
    return isValid;
  }

  handleChange(event) {
    let values = this.state.formValues;
    values[event.target.id] = event.target.value;
    this.setState({ formValues: values });
  }

  cleanEditForm = () => {
    document.getElementById('firstNameEdit').value = '';
    document.getElementById('lastNameEdit').value = '';
    document.getElementById('emailAddressEdit').value = '';
    document.getElementById('institutionEdit').value = '';
    document.getElementById('contributionEdit').value = '';
  };

  onSave = () => {
    if (this.validateFormValues(this.state.formValues)) {
      document.getElementById('firstName').value = '';
      document.getElementById('lastName').value = '';
      document.getElementById('emailAddress').value = '';
      document.getElementById('institution').value = '';
      document.getElementById('contribution').value = '';
      const list = this.state.contribs.concat(this.state.formValues);
      this.setState({ formOpen: false, contribs: list, formValues: {} });
    }
  };

  onSaveEdit = () => {
    let tmp = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      emailAddress: this.state.emailAddress,
      institution: this.state.institution,
      contribution: this.state.contribution,
    };
    if (this.validateFormValues(tmp)) {
      const list = this.state.contribs;
      list[this.state.contributorIndex] = tmp;
      this.cleanEditForm();
      this.setState({
        contribs: list,
        detailOpen: false,
        firstName: '',
        lastName: '',
        emailAddress: '',
        institution: '',
        contribution: '',
      });
    }
  };

  // toggles add form, closes detail
  onClickAddButton = (newStatus) => {
    this.setState({ formOpen: newStatus, detailOpen: false });
  };

  // explicit close add form
  closeFormBody = () => {
    this.setState({ formOpen: false });
  };

  // explicit close add form
  closeDetailBody = () => {
    this.cleanEditForm();
    this.setState({ detailOpen: false });
  };

  // toogles Detail, closes form
  onClickDetailButton = (newStatus, index = -1) => {
    if (index >= 0) {
      this.setState({
        detailOpen: newStatus,
        formOpen: false,
        contributorIndex: index,
        current: this.state.contribs[index],
        value: this.state.contribs[index].firstName,
        firstName: this.state.contribs[index].firstName,
        lastName: this.state.contribs[index].lastName,
        emailAddress: this.state.contribs[index].emailAddress,
        institution: this.state.contribs[index].institution,
        contribution: this.state.contribs[index].contribution,
      });
    }
  };

  handleChangeFirstName(event) {
    this.setState({ firstName: event.target.value });
  }

  handleChangeLastName(event) {
    this.setState({ lastName: event.target.value });
  }

  handleChangeEmailAddress(event) {
    this.setState({ emailAddress: event.target.value });
  }

  handleChangeInstitution(event) {
    this.setState({ institution: event.target.value });
  }

  handleChangeContribution(event) {
    this.setState({ contribution: event.target.value });
  }

  renderEditForm = (detailOpen) => {
    return (
      <div className="card card-body">
        <h5>Edit Contributor</h5>
        <div className="form-row">
          <div className="form-group col-md-3">
            <label htmlFor="firstNameEdit">First Name</label>
            <input type="text" className="form-control"
                   id="firstNameEdit"
                   onChange={this.handleChangeFirstName}
                   value={this.state.firstName}
            />
          </div>
          <div className="form-group col-md-3">
            <label htmlFor="lastNameEdit">Last Name</label>
            <input type="text" className="form-control"
                   id="lastNameEdit"
                   onChange={this.handleChangeLastName}
                   value={this.state.lastName}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="emailAddressEdit">Email Address</label>
            <input
              type="emailEdit"
              className="form-control"
              id="emailAddressEdit"
              placeholder="name@example.com"
              onChange={this.handleChangeEmailAddress}
              value={this.state.emailAddress}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="institutionEdit">Institution
              (optional)</label>
            <input
              type="text"
              className="form-control"
              id="institutionEdit"
              onChange={this.handleChangeInstitution}
              value={this.state.institution}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="contributionEdit">Contribution
              (optional)</label>
            <input
              type="text"
              className="form-control"
              id="contributionEdit"
              onChange={this.handleChangeContribution}
              value={this.state.contribution}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group col-md-2">
            <Button
              className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
              onClick={() => this.closeDetailBody()}
              aria-controls="contributorEditForm"
              aria-expanded={detailOpen}
            >
              Cancel
            </Button>
          </div>
          <div className="form-group col-md-2">
            {/* TODO: add remove function / worklfow */}
            <Button
              className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
              onClick={() => this.closeDetailBody()}
              aria-controls="contributorEditForm"
              aria-expanded={detailOpen}
            >
              Remove
            </Button>
          </div>
          <div className="form-group col-md-4" />
          <div className="form-group col-md-4">
            <Button
              className="btn btn-secondary btn-sm btn-block btn-light-blue"
              onClick={this.onSaveEdit}
              aria-controls="contributorEditForm"
              aria-expanded={detailOpen}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    console.log('ContributorsForm render');
    console.log(this.props.currentContributor);
    console.log('----------------------');
    console.log(this.state);
    console.log('---------------------------------');
    const { formOpen, detailOpen } = this.state;
    let editForm = this.renderEditForm(detailOpen);

    let contributors = this.state.contribs.map((c, index) => {
      return <li key={index} className="list-inline-item">
        <Button
          className="btn btn-primary btn-contributor"
          onClick={() => this.onClickDetailButton(!detailOpen, index)}
          aria-controls="contributorForm"
          aria-expanded={detailOpen}
        >
          <i className="fa fa-bars" /> {`${c.firstName} ${c.lastName}`}
        </Button>
      </li>;
    });

    // TODO: https://react-bootstrap.netlify.com/
    return (
      <div>
        <header className="header header-left form-header-top mb-3">
          <h2 className="section-title">Contributors</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <div className="form-group">
          <ul className="list-inline">
            <li className="list-inline-item">
              <p className="contributor">Contributors:</p>
            </li>
            {contributors}
            <li className="list-inline-item">
              <Button
                className="btn btn-primary btn-contributor"
                onClick={() => this.onClickAddButton(!formOpen)}
                aria-controls="contributorForm"
                aria-expanded={formOpen}
              >
                <i className="fa fa-plus" /> add contributor
              </Button>
            </li>
          </ul>

          {/* TODO: pre-fill detail form (easy), then update detail */}

          <Collapse in={this.state.formOpen}>
            <div className="card card-body">
              <h5>Add Contributor</h5>
              <div className="form-row">
                <div className="form-group col-md-3">
                  <label htmlFor="firstName">First Name</label>
                  <input type="text" className="form-control"
                         id="firstName"
                         onChange={this.handleChange}
                  />
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" className="form-control" id="lastName"
                         onChange={this.handleChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="emailAddress">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailAddress"
                    placeholder="name@example.com"
                    // defaultValue={emailAddress}
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="institution">Institution (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="institution"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="contribution">Contribution
                    (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contribution"
                    onChange={this.handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-2">
                  <Button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                    onClick={() => this.closeFormBody()}
                    aria-controls="contributorForm"
                    aria-expanded={formOpen}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="form-group col-md-2">
                </div>
                <div className="form-group col-md-4" />
                <div className="form-group col-md-4">
                  <Button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue"
                    onClick={this.onSave}
                    aria-controls="contributorForm"
                    aria-expanded={formOpen}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </Collapse>

          <Collapse in={this.state.detailOpen}>
            {editForm}
          </Collapse>

        </div>
      </div>
    );
  }
}

ContributorsForm.propTypes = {
  contributors: PropTypes.object,
  addContributor: PropTypes.func,
  changeContributor: PropTypes.func,
  updateCurrentContributor: PropTypes.func,
  updateContributor: PropTypes.func,
  currentContributor: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  contributors: makeSelectContributors(),
  currentContributor: makeSelectCurrentContributor(),
});


function mapDispatchToProps(dispatch) {
  return {
    addContributor: contributor => dispatch(addContributor(contributor)),
    changeContributor: index => dispatch(changeContributor(index)),
    updateCurrentContributor: (contributor) => dispatch(updateCurrentContributor(contributor)),
    updateContributor: (index, contributor) => dispatch(updateContributor(index, contributor)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributorsForm);

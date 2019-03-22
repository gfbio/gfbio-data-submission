/**
 *
 * ContributersForm
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
} from '../../containers/SubmissionForm/actions';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class ContributersForm extends React.PureComponent {
  // TODO: needs actual Functionality. Maybe a connection to store/reducer

  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      editFormValues: {},
      formOpen: false,
      detailOpen: false,
      contributorIndex: -1,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeEdit = this.handleChangeEdit.bind(this);
  }

  validateFormValues() {
    // console.log('validateFormValues');
    let isValid = true;
    let formValues = this.state.formValues;
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

  validateEditFormValues() {
    let isValid = true;
    let formValues = this.state.editFormValues;
    console.log('validteEditFormVAlues');
    console.log(formValues);
    if (!formValues['firstNameEdit']) {
      isValid = false;
    }
    if (!formValues['lastNameEdit']) {
      isValid = false;
    }
    if (!formValues['emailAddressEdit']) {
      isValid = false;
    }
    return isValid;
  }

  handleChange(event) {
    console.log('handleChange ' + event.target.id);
    let values = this.state.formValues;
    values[event.target.id] = event.target.value;
    this.setState({ formValues: values });
  }

  handleChangeEdit(event) {
    console.log('handleChangeEdit ' + event.target.id);
    let values = this.state.editFormValues;
    values[event.target.id] = event.target.value;
    this.setState({ editFormValues: values });
  }

  onSave = () => {
    if (this.validateFormValues()) {
      this.props.addContributor(this.state.formValues);
      document.getElementById('firstName').value = '';
      document.getElementById('lastName').value = '';
      document.getElementById('emailAddress').value = '';
      document.getElementById('institution').value = '';
      document.getElementById('contribution').value = '';
      this.setState({ formValues: {}, formOpen: false });
    }
  };

  onSaveEdit = (index) => {
    console.log('onsave edit -> ' + this.state.contributorIndex);
    if (this.validateEditFormValues()) {
      console.log('edit valid');
      this.props.updateContributor(index, this.state.editFormValues);
      document.getElementById('firstNameEdit').value = '';
      document.getElementById('lastNameEdit').value = '';
      document.getElementById('emailAddressEdit').value = '';
      document.getElementById('institutionEdit').value = '';
      document.getElementById('contributionEdit').value = '';
      this.setState({ editFormValues: {}, detailOpen: false });
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

  // toogles Detail, closes form
  onClickDetailButton = (newStatus, index = -1) => {
    if (index >= 0) {
      this.props.changeContributor(index);
      this.setState({
        detailOpen: newStatus,
        formOpen: false,
        contributorIndex: index,
        editFormValues: {
          firstNameEdit: this.props.currentContributor.firstName,
          lastNameEdit: this.props.currentContributor.lastName,
          emailAddressEdit: this.props.currentContributor.emailAddress,
          institutionEdit: this.props.currentContributor.institution,
          contributionEdit: this.props.currentContributor.contribution,
        },
      });
    }
  };

  render() {
    console.log('ContributersForm render');
    // console.log(this.props.currentContributor);
    console.log(this.state);
    const { formOpen, detailOpen } = this.state;
    const { firstName, lastName, emailAddress, institution, contribution } = this.props.currentContributor;
    console.log(firstName, ' ', lastName);

    let contributors = this.props.contributors.map((c, index) => {
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

            {/* actual form button */}
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

          <Collapse in={this.state.formOpen}>
            <div className="card card-body">
              <h5>Add Contributor</h5>
              <div className="form-row">
                <div className="form-group col-md-3">

                  <label htmlFor="firstName">First Name</label>
                  <input type="text" className="form-control"
                         id="firstName" onChange={this.handleChange}
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
            <div className="card card-body">
              <h5>Edit Contributor</h5>
              <div className="form-row">
                <div className="form-group col-md-3">

                  <label htmlFor="firstNameEdit">First Name</label>
                  <input type="text" className="form-control"
                         id="firstNameEdit"
                         onChange={this.handleChangeEdit}
                         defaultValue={firstName}
                  />

                </div>
                <div className="form-group col-md-3">

                  <label htmlFor="lastNameEdit">Last Name</label>
                  <input type="text" className="form-control" id="lastNameEdit"
                         onChange={this.handleChangeEdit}
                         defaultValue={lastName}
                  />

                </div>
                <div className="form-group col-md-6">

                  <label htmlFor="emailAddressEdit">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailAddressEdit"
                    placeholder="name@example.com"
                    onChange={this.handleChangeEdit}
                    defaultValue={emailAddress}
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
                    onChange={this.handleChangeEdit}
                    defaultValue={institution}
                  />

                </div>
                <div className="form-group col-md-6">

                  <label htmlFor="contributionEdit">Contribution
                    (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contributionEdit"
                    onChange={this.handleChangeEdit}
                    defaultValue={contribution}
                  />

                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-2">

                  <button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                    data-toggle="collapse"
                    data-target="#contributorDetailWrapper"
                    aria-expanded="false"
                    aria-controls="contributorDetailWrapper"
                  >
                    Cancel
                  </button>

                </div>
                <div className="form-group col-md-2">

                  <button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                    data-toggle="collapse"
                    data-target="#contributorDetailWrapper"
                    aria-expanded="false"
                    aria-controls="contributorDetailWrapper"
                  >
                    Remove
                  </button>

                </div>
                <div className="form-group col-md-4" />
                <div className="form-group col-md-4">

                  <button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue"
                    onClick={this.onSaveEdit}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </Collapse>


        </div>
      </div>
    );
  }
}

ContributersForm.propTypes = {
  contributors: PropTypes.object,
  addContributor: PropTypes.func,
  changeContributor: PropTypes.func,
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
    updateContributor: (index, contributor) => dispatch(updateContributor(index, contributor)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributersForm);

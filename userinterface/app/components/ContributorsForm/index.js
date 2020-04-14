/**
 *
 * ContributorsForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import { Multiselect } from 'multiselect-react-dropdown';
import {
  addContributor,
  removeContributor,
  setContributors,
  updateContributor,
} from '../../containers/SubmissionForm/actions';
import { makeSelectContributors } from '../../containers/SubmissionForm/selectors';
import RolesInfo from './rolesInfo';

/* eslint-disable react/prefer-stateless-function */
class ContributorsForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      emailAddress: '',
      institution: '',
      roles: [],
      formValues: {},
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
    this.roleOptions = [
      { role: 'Author/Creator', id: 0, category: 'Primary' },
      { role: 'Content Contact', id: 1, category: 'Secondary' },
      { role: 'Principal Investigator', id: 2, category: 'Secondary' },
      { role: 'Data Owner', id: 3 },
      { role: 'Data Curator', id: 4 },
      { role: 'Data Editor/Data Manager', id: 5 },
      { role: 'Data Owner Contact', id: 6 },
      { role: 'Researcher', id: 7 },
      { role: 'Data Source Organisation', id: 8 },
    ];
  }

  static validateFormValues(formValues) {
    let isValid = true;
    if (!formValues.firstName) {
      isValid = false;
    }
    // if (typeof formValues['firstName'] !== 'undefined') {
    //   if (!formValues['firstName'].match(/^[a-zA-Z]+$/)) {
    //     isValid = false;
    //   }
    // }

    // No last name required currently
    if (!formValues.lastName) {
      isValid = false;
    }

    // if (typeof formValues['lastName'] !== 'undefined') {
    //   if (!formValues['lastName'].match(/^[a-zA-Z]+$/)) {
    //     isValid = false;
    //   }
    // }
    if (!formValues.emailAddress) {
      isValid = false;
    }

    // if (typeof formValues['emailAddress'] !== 'undefined') {
    //   const pattern = /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
    //   const result = pattern.test(formValues['emailAddress']);
    //   if (result === false) {
    //     isValid = false;
    //   }
    // }
    return isValid;
  }

  handleChange(event) {
    const values = this.state.formValues;
    values[event.target.id] = event.target.value;
    this.setState({ formValues: values });
  }

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

  cleanEditForm = () => {
    document.getElementById('firstNameEdit').value = '';
    document.getElementById('lastNameEdit').value = '';
    document.getElementById('emailAddressEdit').value = '';
    document.getElementById('institutionEdit').value = '';
  };

  onSave = () => {
    if (ContributorsForm.validateFormValues(this.state.formValues)) {
      document.getElementById('firstName').value = '';
      document.getElementById('lastName').value = '';
      document.getElementById('emailAddress').value = '';
      document.getElementById('institution').value = '';
      this.props.addContributor(this.state.formValues);
      this.setState({ formOpen: false, formValues: {}, roles: [] });
    }
  };

  onSaveEdit = () => {
    const tmp = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      emailAddress: this.state.emailAddress,
      institution: this.state.institution,
      contribution: this.rolesToCSV(this.state.roles),
    };
    if (ContributorsForm.validateFormValues(tmp)) {
      this.props.updateContributor(tmp, this.state.contributorIndex);
      this.cleanEditForm();
      this.setState({
        detailOpen: false,
        firstName: '',
        lastName: '',
        emailAddress: '',
        institution: '',
        roles: [],
      });
    }
  };

  // toggles add form, closes detail
  onClickAddButton = newStatus => {
    this.setState({
      formOpen: newStatus,
      detailOpen: false,
      roles: [],
    });
  };

  // explicit close add form
  closeFormBody = () => {
    this.setState({
      formOpen: false,
    });
  };

  // explicit close add form
  closeDetailBody = () => {
    this.cleanEditForm();
    this.setState({
      detailOpen: false,
    });
  };

  onClickRemove = () => {
    this.cleanEditForm();
    this.props.removeContributor(this.state.contributorIndex);
    this.setState({ detailOpen: false });
  };

  getContributorsAsArray() {
    let contributors = this.props.contributors;
    // console.log('contributors click Detail');
    // console.log(this.props.contributors);
    // console.log(typeof this.props.contributors);
    if (!Array.isArray(this.props.contributors)) {
      // console.log('no array. set local contribs');
      contributors = this.props.contributors.toJS();
    }
    return contributors;
  }

  rolesToCSV(selectedList) {
    // roles to string
    let rolesCSV = '';
    selectedList.forEach(role => {
      rolesCSV += `${role.role},`;
    });
    rolesCSV = rolesCSV.slice(0, -1); // remove last comma
    return rolesCSV;
  }

  rolesToArray(csv) {
    if (!csv || csv.length === 0) {
      return [];
    }
    const rolesArray = csv.split(',');
    const selectedList = [];
    rolesArray.forEach(role => {
      this.roleOptions.forEach(option => {
        if (option.role === role) {
          selectedList.push(option);
        }
      });
    });
    return selectedList;
  }

  // toogles Detail, closes form
  onClickDetailButton = (newStatus, index = -1) => {
    if (index >= 0) {
      // TODO: read about how this can be handled in immutable js
      const contributors = this.getContributorsAsArray();
      const rolesArr = this.rolesToArray(contributors[index].contribution);
      this.setState({
        detailOpen: newStatus,
        formOpen: false,
        contributorIndex: index,
        current: contributors[index],
        value: contributors[index].firstName,
        firstName: contributors[index].firstName,
        lastName: contributors[index].lastName,
        emailAddress: contributors[index].emailAddress,
        institution: contributors[index].institution,
        roles: rolesArr,
      });
    }
  };

  // on role select or remove
  onSelectChange = selectedList => {
    const values = this.state.formValues;
    values.contribution = this.rolesToCSV(selectedList);
    this.setState({
      roles: selectedList,
      formValues: values,
    });
  };

  renderEditForm = detailOpen => (
    <div className="card card-body">
      <h5>Edit Contributor</h5>
      <div className="form-row">
        <div className="form-group col-md-3">
          <label htmlFor="firstNameEdit">First Name</label>
          <input
            type="text"
            className="form-control"
            id="firstNameEdit"
            onChange={this.handleChangeFirstName}
            value={this.state.firstName}
          />
        </div>
        <div className="form-group col-md-3">
          <label htmlFor="lastNameEdit">Last Name</label>
          <input
            type="text"
            className="form-control"
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
          <label htmlFor="institutionEdit">Institution (optional)</label>
          <input
            type="text"
            className="form-control"
            id="institutionEdit"
            onChange={this.handleChangeInstitution}
            value={this.state.institution}
          />
        </div>
        <div className="form-group col-md-6">
          <label htmlFor="contribution">
            Contributor Role (optional)
            <a
              className="align-bottom"
              data-toggle="modal"
              data-target="#rolesInfo"
            >
              <i
                className="icon ion-ios-help-circle-outline question-pointer"
                aria-hidden="true"
              />
            </a>
          </label>
          <Multiselect
            placeholder="Select Roles"
            options={this.roleOptions} // Options to display in the dropdown
            selectedValues={this.state.roles} // Preselected value to persist in dropdown
            onSelect={this.onSelectChange} // Function will trigger on select event
            onRemove={this.onSelectChange} // Function will trigger on remove event
            displayValue="role" // Property name to display in the dropdown options
            groupBy="category"
            closeOnSelect={false}
            closeIcon="circle"
            showCheckbox
            avoidHighlightFirstOption
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
            onClick={() => this.onClickRemove()}
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

  render() {
    const { formOpen, detailOpen } = this.state;
    const editForm = this.renderEditForm(detailOpen);

    // console.log('contributors click RENDER');
    // console.log(this.state);
    // console.log(this.props.contributors);
    // console.log(typeof this.props.contributors);
    const contributorsArray = this.getContributorsAsArray();

    const contributors = contributorsArray.map((c, index) => (
      <li key={index} className="list-inline-item">
        <Button
          className="btn btn-primary btn-contributor"
          onClick={() => this.onClickDetailButton(!detailOpen, index)}
          aria-controls="contributorForm"
          aria-expanded={detailOpen}
        >
          <i className="fa fa-bars" /> {`${c.firstName} ${c.lastName}`}
        </Button>
      </li>
    ));

    // TODO: https://react-bootstrap.netlify.com/
    return (
      <div>
        <RolesInfo />
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

          <Collapse in={this.state.formOpen}>
            <div className="card card-body">
              <h5>Add Contributor</h5>
              <div className="form-row">
                <div className="form-group col-md-3">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="firstName"
                    onChange={this.handleChange}
                  />
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastName"
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
                  <label htmlFor="contribution">
                    Contributor Role (optional)
                    <a
                      className="align-bottom"
                      data-toggle="modal"
                      data-target="#rolesInfo"
                    >
                      <i
                        className="icon ion-ios-help-circle-outline question-pointer"
                        aria-hidden="true"
                      />
                    </a>
                  </label>
                  <Multiselect
                    placeholder="Select Roles"
                    options={this.roleOptions} // Options to display in the dropdown
                    selectedValues={this.state.roles} // Preselected value to persist in dropdown
                    onSelect={this.onSelectChange} // Function will trigger on select event
                    onRemove={this.onSelectChange} // Function will trigger on remove event
                    displayValue="role" // Property name to display in the dropdown options
                    groupBy="category"
                    closeOnSelect={false}
                    closeIcon="circle"
                    showCheckbox
                    avoidHighlightFirstOption
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
                <div className="form-group col-md-2" />
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

          <Collapse in={this.state.detailOpen}>{editForm}</Collapse>
        </div>
      </div>
    );
  }
}

ContributorsForm.propTypes = {
  setContributors: PropTypes.func,
  addContributor: PropTypes.func,
  updateContributor: PropTypes.func,
  removeContributor: PropTypes.func,
  contributors: PropTypes.array,
};

const mapStateToProps = createStructuredSelector({
  contributors: makeSelectContributors(),
});

function mapDispatchToProps(dispatch) {
  return {
    setContributors: contributors => dispatch(setContributors(contributors)),
    addContributor: contributor => dispatch(addContributor(contributor)),
    removeContributor: index => dispatch(removeContributor(index)),
    updateContributor: (contributor, index) =>
      dispatch(updateContributor(contributor, index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributorsForm);

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
      formOpen: false,
    };
    this.handleChange = this.handleChange.bind(this);
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

  handleChange(event) {
    let values = this.state.formValues;
    values[event.target.id] = event.target.value;
    this.setState({ formValues: values });
  }

  onSave = () => {
    // console.log('ContributersForm onSave');
    // console.log(this.state);
    let isValid = this.validateFormValues();
    // console.log('valiud ? ' + isValid);
    if (this.validateFormValues()) {
      this.props.addContributor(this.state.formValues);
      document.getElementById('firstName').value = '';
      document.getElementById('lastName').value = '';
      document.getElementById('emailAddress').value = '';
      document.getElementById('institution').value = '';
      document.getElementById('contribution').value = '';
      // WRONG: whole doc is parse
      // let elements = document.getElementsByTagName('input');
      // console.log(elements);
      // for (let i in elements) {
      //   elements[i].value = '';
      // }
      this.setState({ formValues: {} });
    }
  };

  // toggles add form
  onClickAddButton = (openStatus) => {
    this.setState({ formOpen: openStatus });
  };

  // explicit close add form
  closeFormBody = () => {
    this.setState({ formOpen: false });
  };

  render() {
    console.log('ContributersForm render');
    console.log(this.props.currentContributor);
    const { formOpen } = this.state;
    let contributors = this.props.contributors.map((c, index) => {
      return <li key={index} className="list-inline-item">
        {/*<button*/}
        {/*className="btn btn-primary btn-contributor"*/}
        {/*type="button"*/}
        {/*data-toggle="collapse"*/}
        {/*data-target='#contributorDetailWrapper'*/}
        {/*aria-expanded="false"*/}
        {/*aria-controls='#contributorDetailWrapper'*/}
        {/*onClick={() => this.props.changeContributor(index)}*/}
        {/*>*/}
        {/*<i className="fa fa-bars" /> {`${c.firstName} ${c.lastName}`}*/}
        {/*</button>*/}
      </li>;
    });

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

            {/* detail button mock */}
            <li className="list-inline-item">
              <button
                className="btn btn-primary btn-contributor"
                type="button"
                data-toggle="collapse"
                data-target='#contributorDetailWrapper'
                aria-expanded="false"
                aria-controls='#contributorDetailWrapper'
                // onClick={() => this.props.changeContributor(index)}
              >
                <i className="fa fa-bars" /> horst meier
              </button>
            </li>

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
            <div id="contributorForm">
              <div className="card card-body">
                <h5>Add Contributor</h5>
                <div className="form-row">
                  <div className="form-group col-md-3">

                    <label htmlFor="firstName">First Name</label>
                    <input type="text" className="form-control"
                           id="firstName" onChange={this.handleChange}
                      // required
                    />

                  </div>
                  <div className="form-group col-md-3">

                    <label htmlFor="lastName">Last Name</label>
                    <input type="text" className="form-control" id="lastName"
                           onChange={this.handleChange}
                      // required
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
                      // required
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

                    <button
                      className="btn btn-secondary btn-sm btn-block btn-light-blue"
                      onClick={this.onSave}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Collapse>

          <div className="accordion" id="accordion">

            <div className="collapse" id="contributorDetailWrapper"
                 aria-labelledby="headingTwo" data-parent="#accordion">
              <h3><i>tmp header detail</i></h3>

              <div className="card card-body">
                {/*<h5>Edit Contributor</h5>*/}
                {/*<div className="form-row">*/}
                {/*<div className="form-group col-md-3">*/}

                {/*<label htmlFor="firstName">First Name</label>*/}
                {/*<input type="text" className="form-control"*/}
                {/*id="firstName" onChange={this.handleChange}*/}
                {/*value={tmpContributor.firstName}*/}
                {/*// required*/}
                {/*/>*/}

                {/*</div>*/}
                {/*<div className="form-group col-md-3">*/}

                {/*<label htmlFor="lastName">Last Name</label>*/}
                {/*<input type="text" className="form-control" id="lastName"*/}
                {/*onChange={this.handleChange}*/}
                {/*value={tmpContributor.lastName}*/}
                {/*// required*/}
                {/*/>*/}

                {/*</div>*/}
                {/*<div className="form-group col-md-6">*/}

                {/*<label htmlFor="emailAddress">Email Address</label>*/}
                {/*<input*/}
                {/*type="email"*/}
                {/*className="form-control"*/}
                {/*id="emailAddress"*/}
                {/*placeholder="name@example.com"*/}
                {/*onChange={this.handleChange}*/}
                {/*value={tmpContributor.emailAddress}*/}
                {/*// required*/}
                {/*/>*/}

                {/*</div>*/}
                {/*</div>*/}
                {/*<div className="form-row">*/}
                {/*<div className="form-group col-md-6">*/}

                {/*<label htmlFor="institution">Institution (optional)</label>*/}
                {/*<input*/}
                {/*type="text"*/}
                {/*className="form-control"*/}
                {/*id="institution"*/}
                {/*onChange={this.handleChange}*/}
                {/*value={tmpContributor.institution}*/}
                {/*/>*/}

                {/*</div>*/}
                {/*<div className="form-group col-md-6">*/}

                {/*<label htmlFor="contribution">Contribution*/}
                {/*(optional)</label>*/}
                {/*<input*/}
                {/*type="text"*/}
                {/*className="form-control"*/}
                {/*id="contribution"*/}
                {/*onChange={this.handleChange}*/}
                {/*value={tmpContributor.contribution}*/}
                {/*/>*/}

                {/*</div>*/}
                {/*</div>*/}
                {/*<div className="form-row">*/}
                {/*<div className="form-group col-md-2">*/}

                <button
                  className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                  data-toggle="collapse"
                  data-target="#contributorDetailWrapper"
                  aria-expanded="false"
                  aria-controls="contributorDetailWrapper"
                >
                  Cancel
                </button>

                {/*</div>*/}
                {/*<div className="form-group col-md-2">*/}

                <button
                  className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted"
                  data-toggle="collapse"
                  data-target="#contributorDetailWrapper"
                  aria-expanded="false"
                  aria-controls="contributorDetailWrapper"
                >
                  Remove
                </button>

                {/*</div>*/}
                {/*<div className="form-group col-md-4" />*/}
                {/*<div className="form-group col-md-4">*/}

                <button
                  className="btn btn-secondary btn-sm btn-block btn-light-blue"
                  // onClick={this.onSave}
                >
                  Save
                </button>
                {/*</div>*/}
                {/*</div>*/}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ContributersForm.propTypes = {
  contributors: PropTypes.object,
  addContributor: PropTypes.func,
  changeContributor: PropTypes.func,
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
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributersForm);

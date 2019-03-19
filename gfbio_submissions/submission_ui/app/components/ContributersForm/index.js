/**
 *
 * ContributersForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { makeSelectContributors } from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { addContributor } from '../../containers/SubmissionForm/actions';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class ContributersForm extends React.PureComponent {
  // TODO: needs actual Functionality. Maybe a connection to store/reducer

  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
      // errors: {},
    };
    this.handleChange = this.handleChange.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  validateFormValues() {
    // console.log('validateFormValues');
    let isValid = true;
    let formValues = this.state.formValues;
    if (!formValues['firstName']) {
      isValid = false;
    }
    if (typeof formValues['firstName'] !== 'undefined') {
      if (!formValues['firstName'].match(/^[a-zA-Z]+$/)) {
        isValid = false;
      }
    }
    if (!formValues['lastName']) {
      isValid = false;
    }
    if (typeof formValues['lastName'] !== 'undefined') {
      if (!formValues['lastName'].match(/^[a-zA-Z]+$/)) {
        isValid = false;
      }
    }
    if (!formValues['emailAddress']) {
      isValid = false;
    }

    if (typeof formValues['emailAddress'] !== 'undefined') {
      const pattern = /[a-zA-Z0-9]+[\.]?([a-zA-Z0-9]+)?[\@][a-z]{3,9}[\.][a-z]{2,5}/g;
      const result = pattern.test(formValues['emailAddress']);
      if (result === false) {
        isValid = false;
      }
    }
    return isValid;
  }

  handleChange(event) {
    let values = this.state.formValues;
    values[event.target.id] = event.target.value;
    this.setState({ formValues: values });
  }

  onSave = () => {
    console.log('ContributersForm onSave');
    console.log(this.state);
    let isValid = this.validateFormValues();
    console.log('valiud ? ' + isValid);
    if (this.validateFormValues()) {
      this.props.addContributor(this.state.formValues);
      this.setState({ formValues: {} });
    }
  };

  render() {
    console.log('ContributersForm render');
    console.log(this.props);
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

            {/*<li className="list-inline-item">*/}
            {/*<button*/}
            {/*className="btn btn-primary btn-contributor"*/}
            {/*type="button"*/}
            {/*data-toggle="collapse"*/}
            {/*data-target="#collapseExample"*/}
            {/*aria-expanded="false"*/}
            {/*aria-controls="collapseExample"*/}
            {/*>*/}
            {/*<i className="fa fa-bars" /> Marc Weber*/}
            {/*</button>*/}
            {/*</li>*/}

            <li className="list-inline-item">
              <button
                className="btn btn-primary btn-contributor"
                type="button"
                data-toggle="collapse"
                data-target="#collapseExample"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                <i className="fa fa-plus" /> add contributor
              </button>
            </li>

          </ul>

          <div className="collapse" id="collapseExample">
            <div className="card card-body">
              <h5>Add Contributor</h5>
              <div className="form-row">
                <div className="form-group col-md-3">

                  <label htmlFor="firstName">First Name</label>
                  <input type="text" className="form-control"
                         id="firstName" onChange={this.handleChange} required />

                </div>
                <div className="form-group col-md-3">

                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" className="form-control" id="lastName"
                         onChange={this.handleChange} required />

                </div>
                <div className="form-group col-md-6">

                  <label htmlFor="emailAddress">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailAddress"
                    placeholder="name@example.com"
                    onChange={this.handleChange}
                    required
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

                  <button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted">
                    Cancel
                  </button>

                </div>
                <div className="form-group col-md-2">

                  <button
                    className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted">
                    Remove
                  </button>

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
        </div>
      </div>
    );
  }
}

ContributersForm.propTypes = {
  contributors: PropTypes.object,
  addContributor: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  contributors: makeSelectContributors(),
});


function mapDispatchToProps(dispatch) {
  return {
    addContributor: contributor => dispatch(addContributor(contributor)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributersForm);

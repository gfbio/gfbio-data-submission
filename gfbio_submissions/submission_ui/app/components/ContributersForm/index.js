/**
 *
 * ContributersForm
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class ContributersForm extends React.PureComponent {
  render() {
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
            <li className="list-inline-item">
              <button
                className="btn btn-primary btn-contributor"
                type="button"
                data-toggle="collapse"
                data-target="#collapseExample"
                aria-expanded="false"
                aria-controls="collapseExample"
              >
                <i className="fa fa-bars" /> Marc Weber
              </button>
            </li>
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
                  <input type="text" className="form-control" id="firstName" />
                </div>
                <div className="form-group col-md-3">
                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" className="form-control" id="lastName" />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="emailAddress">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailAddress"
                    placeholder="name@example.com"
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
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="contribution">Contribution (optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    id="contribution"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group col-md-2">
                  <button className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted">
                    Cancel
                  </button>
                </div>
                <div className="form-group col-md-2">
                  <button className="btn btn-secondary btn-sm btn-block btn-light-blue-inverted">
                    Remove
                  </button>
                </div>
                <div className="form-group col-md-4" />
                <div className="form-group col-md-4">
                  <button className="btn btn-secondary btn-sm btn-block btn-light-blue">
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

ContributersForm.propTypes = {};

export default ContributersForm;

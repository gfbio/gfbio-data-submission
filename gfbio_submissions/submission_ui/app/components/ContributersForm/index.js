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
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class ContributersForm extends React.PureComponent {
  // TODO: needs actual Functionality. Maybe a connection to store/reducer

  constructor(props) {
    super(props);
    this.state = {
      formValues: {},
    };
    this.handleChange = this.handleChange.bind(this);
  }

  /*
  * <Input id="number"
       type="time"
       onChange={(evt) => { console.log(evt.target.value); }} />


       //Email
        if(!fields["email"]){
           formIsValid = false;
           errors["email"] = "Cannot be empty";
        }

        if(typeof fields["email"] !== "undefined"){
           let lastAtPos = fields["email"].lastIndexOf('@');
           let lastDotPos = fields["email"].lastIndexOf('.');

           if (!(lastAtPos < lastDotPos && lastAtPos > 0 && fields["email"].indexOf('@@') == -1 && lastDotPos > 2 && (fields["email"].length - lastDotPos) > 2)) {
              formIsValid = false;
              errors["email"] = "Email is not valid";
            }
       }


  * */

  handleChange(event) {
    // console.log('handleChange ');
    let xid = event.target.id;
    let values = this.state.formValues;
    values[event.target.id] = event.target.value;
    this.setState({ formValues: values });
    // console.log('state ');
    // console.log(this.state);
  }

  onSave = () => {
    console.log('ContributersForm onSave');
    console.log(this.state);
  };

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
                         id="firstName" onChange={this.handleChange} />

                </div>
                <div className="form-group col-md-3">

                  <label htmlFor="lastName">Last Name</label>
                  <input type="text" className="form-control" id="lastName"
                         onChange={this.handleChange} />

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
};

const mapStateToProps = createStructuredSelector({
  contributors: makeSelectContributors(),
});


function mapDispatchToProps(dispatch) {
  return {
    // handleDrop: value => dispatch(addFileUpload(value)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(ContributersForm);

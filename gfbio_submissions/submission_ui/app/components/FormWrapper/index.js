/**
 *
 * FormWrapper
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class FormWrapper extends React.PureComponent {
  render() {
    return (
      <form name="wrapping-form" method="" className="pagewide-form">
        <section className="sub-navi">
          <div className="container">
            <div className="row">
              <div className="col-sm-12">
                <nav className="nav">
                  <a className="nav-link" href="#">
                    My Submissions
                  </a>
                  <a className="nav-link active" href="#">
                    Create Submission
                  </a>
                  <a className="nav-link" href="#">
                    Help
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </section>

        <div className="container">
          <div className="row">


          </div>
        </div>

      </form>
    );
  }
}

FormWrapper.propTypes = {};

export default FormWrapper;

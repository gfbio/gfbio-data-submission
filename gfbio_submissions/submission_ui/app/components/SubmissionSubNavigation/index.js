/**
 *
 * SubmissionSubNavigation
 *
 */

import React from 'react';
import { Link } from 'react-router-dom';
// import PropTypes from 'prop-types';

/* eslint-disable react/prefer-stateless-function */
class SubmissionSubNavigation extends React.PureComponent {
  render() {
    return (
      <section className="sub-navi">
        {/*<section className="sub-navigation-header">*/}

        {/*</section>*/}
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <nav className="nav">
                <Link className="nav-link" to="/list">
                  <i className="icon ion-ios-list" />
                  My Submissions
                </Link>
                <Link className="nav-link" to="/form">
                  <i className="icon ion-ios-add-circle-outline" />
                  Create Submission
                </Link>
                <Link className="nav-link" to="/list">
                  <i className="icon ion-ios-help-circle-outline" />
                  Help
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

SubmissionSubNavigation.propTypes = {};

export default SubmissionSubNavigation;

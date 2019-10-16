/**
 *
 * HelpContent
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectHelpContent from './selectors';
import reducer from './reducer';
import saga from './saga';
import { Link } from 'react-router-dom';

/* eslint-disable react/prefer-stateless-function */
export class HelpContent extends React.PureComponent {
  render() {
    return (
      <div className="submission-list-wrapper">
        <div className="container">
          <div className="list-start-wrapper d-flex">
            <div className="container my-auto">
              <div className="row no-gutters text-center">
                <div className="col-md-10 pl-3 align-middle">
                  <Link className="nav-link list-start" to="/help">
                    <p>
                      This is just a placeholder for upcoming knowledge-base
                      content.
                    </p>
                    <i className="icon ion-ios-help-circle-outline" />
                    <p>
                      Please contact <b>help@gfbio.org</b> if you encounter any
                      problems
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

HelpContent.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  helpContent: makeSelectHelpContent(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'helpContent', reducer });
const withSaga = injectSaga({ key: 'helpContent', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(HelpContent);

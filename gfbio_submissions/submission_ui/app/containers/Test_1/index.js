/**
 *
 * Test_1
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectTest_1 from './selectors';
import reducer from './reducer';
import saga from './saga';

/* eslint-disable react/prefer-stateless-function */
export class Test_1 extends React.PureComponent {
  render() {
    return (
      <div>
        <h1>This is Test1</h1>
      </div>
    );
  }
}

Test_1.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  test_1: makeSelectTest_1(),
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

const withReducer = injectReducer({ key: 'test_1', reducer });
const withSaga = injectSaga({ key: 'test_1', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Test_1);

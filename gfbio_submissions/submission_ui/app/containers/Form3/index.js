/**
 *
 * Form3
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectForm3 from './selectors';
import reducer from './reducer';
import saga from './saga';

/* eslint-disable react/prefer-stateless-function */
export class Form3 extends React.Component {
  render() {
    return (
      <div>
        <h2>Form3</h2>
      </div>
    );
  }
}

Form3.propTypes = {
  dispatch: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  form3: makeSelectForm3(),
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

const withReducer = injectReducer({ key: 'form3', reducer });
const withSaga = injectSaga({ key: 'form3', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(Form3);

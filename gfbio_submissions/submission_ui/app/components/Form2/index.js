/**
 *
 * Form2
 *
 */

import React from 'react';
import { Field, reduxForm } from 'redux-form/immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectTestForm2 } from './selectors';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import saga from './saga';
import { compose } from 'redux';
import { submitForm2 } from './actions';

// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class Form2 extends React.PureComponent {
  submit = values => {
    // print the form values to the console
    console.log(values)
  }
  render() {
    return (
      <form
        // onSubmit={this.props.handleSubmit}
      >
        <label>FORM 2</label>
        <div>
          <label htmlFor="firstName">First Name</label>
          <Field name="firstName" component="input" type="text" />
        </div>
        <button type="submit" onClick={this.submit}>Submit</button>
      </form>
    );
  }
}

Form2.propTypes = {
  handleSubmit: PropTypes.func,
  testForm2: PropTypes.object,
};

// works. no connection
export default reduxForm({ form: 'form2' })(Form2);

// const mapStateToProps = createStructuredSelector({
//   testForm2: makeSelectTestForm2(),
// });
//
// function mapDispatchToProps(dispatch) {
//   return {
//     handleSubmit: form => dispatch(submitForm2(form)),
//   };
// }
//
// Form2 = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(Form2);
//
// Form2 = reduxForm({
//   form: 'form2', // a unique name for this form
// })(Form2);
//
// const withReducer = injectReducer({ key: 'submissionForm2', reducer });
// const withSaga = injectSaga({ key: 'submissionForm2', saga });
//
//
// Form2 = compose(
//   withReducer,
//   withSaga,
// )(Form2);
//
// export default Form2;

/*

// const mapStateToProps = state => ({
//   // ...
// });

const mapStateToProps = createStructuredSelector({
  testForm2: makeSelectTestForm2(),
});

// const mapDispatchToProps = dispatch => ({
//   handleSubmit: form => dispatch(submitForm2(form)),
// });

function mapDispatchToProps(dispatch) {
  return {
    handleSubmit: form => dispatch(submitForm2(form)),
  };
}


Form2 = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Form2);

Form2 = reduxForm({
  form: 'form2', // a unique name for this form
})(Form2);

// const withReducer = injectReducer({ key: 'submissionForm2', reducer });
// const withSaga = injectSaga({ key: 'submissionForm2', saga });

export default Form2;

*/


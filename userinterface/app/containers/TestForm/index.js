/**
 *
 * TestForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form/immutable';
import { Field } from 'redux-form';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectTestForm from './selectors';
import reducer from './reducer';
import saga from './saga';
import { submitForm } from '../SubmissionForm/actions';

/* eslint-disable react/prefer-stateless-function */
export class TestForm extends React.Component {
  render() {
    return (
      <form
        // onSubmit={this.props.handleSubmit}
      >
        <div>
          <label>First Name</label>
          <div>
            <Field
              name="firstName"
              component="input"
              type="text"
              placeholder="First Name"
            />
          </div>

          {/*</div>*/}
          {/*<div>*/}
          {/*<label>Last Name</label>*/}
          {/*<div>*/}
          {/*<Field*/}
          {/*name="lastName"*/}
          {/*component="input"*/}
          {/*type="text"*/}
          {/*placeholder="Last Name"*/}
          {/*/>*/}
          {/*</div>*/}
        </div>

        {/*<div>*/}
        {/*<button type="submit">*/}
        {/*Submit*/}
        {/*</button>*/}
        {/*/!*<button type="submit" disabled={pristine || submitting}>*!/*/}
        {/*/!*Submit*!/*/}
        {/*/!*</button>*!/*/}
        {/*/!*<button type="button" disabled={pristine || submitting}*!/*/}
        {/*/!*onClick={reset}>*!/*/}
        {/*/!*Clear Values*!/*/}
        {/*/!*</button>*!/*/}
        {/*</div>*/}
      </form>
    );
  }
}

// TestForm.propTypes = {
//   handleSubmit: PropTypes.func,
// };

// const mapStateToProps = createStructuredSelector({
//   testForm: makeSelectTestForm(),
// });
//
// function mapDispatchToProps(dispatch) {
//   return {
//     handleSubmit: form => dispatch(submitForm(form)),
//   };
// }
//
// TestForm = connect(
//   mapStateToProps,
//   mapDispatchToProps,
// )(TestForm);

export default reduxForm({ form: 'testForm' })(TestForm);
// const withConnect = connect(
//   mapStateToProps,
//   mapDispatchToProps,
//   // reduxForm({
//   //   form: 'testForm',
//   //   enableReinitialize: true,
//   // }),
// );
//
// const withReducer = injectReducer({ key: 'testForm', reducer });
// const withSaga = injectSaga({ key: 'testForm', saga });

// // export default compose(
// TestForm = compose(
//   withReducer,
//   withSaga,
//   withConnect,
// )(TestForm);
//
// export default reduxForm({ form: 'formWrapper' })(TestForm);




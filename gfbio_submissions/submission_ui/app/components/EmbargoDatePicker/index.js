/**
 *
 * EmbargoDatePicker
 *
 */

import React from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import ButtonInput from './ButtonInput';
import { createStructuredSelector } from 'reselect';
import { makeSelectEmbargoDate } from '../../containers/SubmissionForm/selectors';
import { setEmbargoDate } from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class EmbargoDatePicker extends React.Component {

  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Set Embargo</h2>
          <p className="section-subtitle" />
        </header>
        {/*<Modal*/}
        {/*  show={this.props.deleteSubmissionDialog}*/}
        {/*  onHide={this.props.closeDeleteSubmissionDialog}*/}
        {/*  backdrop={true}*/}
        {/*  centered*/}
        {/*>*/}
        <DatePicker
          customInput={
            <ButtonInput
              cssClassName="btn btn-secondary btn-block btn-light-blue"
              iconClassName="fa fa-calendar"
              text="Set Embargo"
            />
          }
          inline
          selected={this.props.embargoDate}
          onChange={this.props.onChange}
          dateFormat="MMMM d, yyyy"
        />
        {/*</Modal>*/}
      </div>

    );
  }
}

EmbargoDatePicker.propTypes = {
  embargoDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  embargoDate: makeSelectEmbargoDate(),
});


function mapDispatchToProps(dispatch) {
  return {
    onChange: date => dispatch(setEmbargoDate(date)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(EmbargoDatePicker);

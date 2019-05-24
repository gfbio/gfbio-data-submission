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
import {
  makeSelectEmbargoDate,
  makeSelectShowEmbargoDialog,
} from '../../containers/SubmissionForm/selectors';
import {
  closeEmbargoDialog,
  setEmbargoDate, showEmbargoDialog,
} from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
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

        <Button variant="secondary" className="btn-block green"
                onClick={this.props.openEmbargoDialog}>
          <i className="icon ion-md-close" />
          SHOW
        </Button>

        <Modal
          show={this.props.showEmbargoDialog}
          onHide={this.props.closeEmbargoDialog}
          backdrop={true}
          centered
        >
          <Modal.Body>
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
            <Button variant="secondary" className="btn-block green"
                    onClick={this.props.closeEmbargoDialog}>
              <i className="icon ion-md-close" />
              CLOSE
            </Button>
          </Modal.Body>
        </Modal>
      </div>

    );
  }
}

EmbargoDatePicker.propTypes = {
  embargoDate: PropTypes.instanceOf(Date),
  onChange: PropTypes.func.isRequired,
  showEmbargoDialog: PropTypes.bool,
  openEmbargoDialog: PropTypes.func,
  closeEmbargoDialog: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  embargoDate: makeSelectEmbargoDate(),
  showEmbargoDialog: makeSelectShowEmbargoDialog(),
});


function mapDispatchToProps(dispatch) {
  return {
    onChange: date => dispatch(setEmbargoDate(date)),
    openEmbargoDialog: () => dispatch(showEmbargoDialog()),
    closeEmbargoDialog: () => dispatch(closeEmbargoDialog()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(EmbargoDatePicker);

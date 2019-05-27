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
import dateFormat from 'dateformat';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
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

        <p className="text-center">
          <span>{dateFormat(this.props.embargoDate, 'dd mmmm yyyy')}</span>
        </p>

        <Button variant="link" className="btn-block btn-link-light-blue"
                onClick={this.props.openEmbargoDialog}>
          <i className="icon ion-md-calendar align-top" />
          <span className="">set embargo date</span>
          {/*<span>{dateFormat(this.props.embargoDate, 'dd mmmm yyyy')}</span>*/}
        </Button>

        <Modal
          show={this.props.showEmbargoDialog}
          onHide={this.props.closeEmbargoDialog}
          backdrop={true}
          centered
        >


          <Modal.Header className="text-center" closeButton>
            <h4>Select Embargo Date</h4>
          </Modal.Header>

          <Modal.Body className="text-center">
            <Container>
              <Row className="show-grid">
                <Col>
                  <p>Current
                    Embargo: <b>{dateFormat(this.props.embargoDate, 'dd mmmm yyyy')}</b>
                  </p>
                </Col>
              </Row>

              <Row className="show-grid mb-4">
                <Col xs={12} md={4}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-light-blue-inverted"
                          onClick={this.props.closeEmbargoDialog}>
                    {/*<i className="icon ion-md-close" />*/}
                    6 months
                  </Button>
                </Col>
                <Col xs={12} md={4}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-light-blue-inverted"
                          onClick={this.props.closeEmbargoDialog}>
                    {/*<i className="icon ion-md-close" />*/}
                    12 months
                  </Button>
                </Col>
                <Col xs={12} md={4}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-light-blue-inverted"
                          onClick={this.props.closeEmbargoDialog}>
                    {/*<i className="icon ion-md-close" />*/}
                    18 months
                  </Button>
                </Col>
              </Row>

              <Row className="show-grid">
                <Col xs={12} md={12}>
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
                  {/*<Button variant="secondary" className="btn-block green"*/}
                  {/*        onClick={this.props.closeEmbargoDialog}>*/}
                  {/*  /!*<i className="icon ion-md-close" />*!/*/}
                  {/*  CLOSE*/}
                  {/*</Button>*/}
                </Col>
              </Row>
            </Container>
          </Modal.Body>

          <Modal.Footer>
            <Container>
              <Row className="show-grid">
                <Col xs={12} md={6}>
                  {/*<p>footer</p>*/}
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-green-inverted"
                          onClick={this.props.closeEmbargoDialog}>
                    {/*<i className="icon ion-md-close" />*/}
                    Cancel
                  </Button>
                </Col>
                <Col xs={12} md={6}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-green-inverted"
                          onClick={this.props.closeEmbargoDialog}>
                    {/*<i className="icon ion-md-calendar fa-lg align-top pr-2" />*/}
                    Set Emargo
                  </Button>
                  {/*  <Button variant="secondary" className="btn-block green"*/}
                  {/*          onClick={this.props.closeDeleteSubmissionDialog}>*/}
                  {/*    <i className="icon ion-md-close" />*/}
                  {/*    Cancel*/}
                  {/*  </Button>*/}
                  {/*</Col>*/}
                  {/*<Col xs={12} md={6} className="text-right">*/}
                  {/*  <Button variant="secondary" className="btn-block red"*/}
                  {/*          onClick={this.props.deleteSubmission}>*/}
                  {/*    <i className="icon ion-md-trash" />*/}
                  {/*    Delete*/}
                  {/*  </Button>*/}
                </Col>
              </Row>
            </Container>
          </Modal.Footer>

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

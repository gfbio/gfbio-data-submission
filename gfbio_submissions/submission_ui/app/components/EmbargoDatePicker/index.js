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
  setEmbargoDate,
  showEmbargoDialog,
} from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import dateFormat from 'dateformat';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

/* eslint-disable react/prefer-stateless-function */
class EmbargoDatePicker extends React.Component {

  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Data Embargo</h2>
          <p className="section-subtitle" />
        </header>

        <p className="text-center">
          <h4>{dateFormat(this.props.embargoDate, 'dd mmmm yyyy')}</h4>
        </p>

        <Button variant="link" className="btn-block btn-link-light-blue"
                onClick={this.props.openEmbargoDialog}>
          <i className="icon ion-md-calendar align-top" />
          <span className="">Change embargo date</span>
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
                          onClick={() => this.props.setEmbargoPeriod(6)}>
                    6 months
                  </Button>
                </Col>
                <Col xs={12} md={4}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-light-blue-inverted"
                          onClick={() => this.props.setEmbargoPeriod(12)}
                  >
                    12 months
                  </Button>
                </Col>
                <Col xs={12} md={4}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-light-blue-inverted"
                          onClick={() => this.props.setEmbargoPeriod(18)}
                  >
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
                </Col>
              </Row>
            </Container>
          </Modal.Body>

          <Modal.Footer>
            <Container>
              <Row className="show-grid">
                <Col xs={12} md={12}>
                  <Button variant="secondary"
                          className="btn-sm btn-block btn-green-inverted"
                          onClick={this.props.closeEmbargoDialog}>
                    Close
                  </Button>
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
  setEmbargoPeriod: PropTypes.func,
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
    setEmbargoPeriod: (months) => dispatch(setEmbargoDate(
      new Date().setMonth(new Date().getMonth() + months),
    )),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(EmbargoDatePicker);

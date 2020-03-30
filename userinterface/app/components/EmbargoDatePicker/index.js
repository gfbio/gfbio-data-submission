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
import {
  closeEmbargoDialog,
  setEmbargoDate,
  showEmbargoDialog,
} from '../../containers/SubmissionForm/actions';
import {
  makeSelectEmbargoDate,
  makeSelectShowEmbargoDialog,
} from '../../containers/SubmissionForm/selectors';
import ButtonInput from './ButtonInput';

/* eslint-disable react/prefer-stateless-function */
class EmbargoDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { embargoDate: this.props.embargoDate };
  }

  render() {
    const setEmbargo = (date, months) => {
      if (date) {
        this.setState((state, props) => ({
          embargoDate: date,
        }));
      } else {
        this.setState((state, props) => ({
          embargoDate: new Date().setMonth(new Date().getMonth() + months),
        }));
      }
    };
    const earliestEmbargoDate = new Date().setDate(new Date().getDate() + 1);
    const latestEmbargoDate = new Date().setMonth(new Date().getMonth() + 24);
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Data Embargo</h2>
          <p className="section-subtitle" />
        </header>

        <p className="text-center">
          <h4>{dateFormat(this.props.embargoDate, 'dd mmmm yyyy')}</h4>
        </p>

        <Button
          variant="link"
          className="btn-block btn-link-light-blue"
          onClick={this.props.openEmbargoDialog}
        >
          <i className="icon ion-md-calendar align-top" />
          <span className="">Change embargo date</span>
        </Button>

        <Modal
          show={this.props.showEmbargoDialog}
          onHide={this.props.closeEmbargoDialog}
          onShow={() => {
            this.setState((state, props) => ({
              embargoDate: this.props.embargoDate,
            }));
          }}
          backdrop
          centered
        >
          <Modal.Header className="text-center" closeButton>
            <h4>Select Embargo Date</h4>
          </Modal.Header>

          <Modal.Body className="text-center">
            <Container>
              <Row className="show-grid">
                <Col>
                  <p>
                    New Embargo:{' '}
                    <b>{dateFormat(this.state.embargoDate, 'dd mmmm yyyy')}</b>
                  </p>
                </Col>
              </Row>

              <Row className="show-grid mb-4">
                <Col xs={12} md={4}>
                  <Button
                    variant="secondary"
                    className="btn-sm btn-block btn-light-blue-inverted"
                    onClick={() => setEmbargo(null, 6)}
                  >
                    6 months
                  </Button>
                </Col>
                <Col xs={12} md={4}>
                  <Button
                    variant="secondary"
                    className="btn-sm btn-block btn-light-blue-inverted"
                    onClick={() => setEmbargo(null, 12)}
                  >
                    12 months
                  </Button>
                </Col>
                <Col xs={12} md={4}>
                  <Button
                    variant="secondary"
                    className="btn-sm btn-block btn-light-blue-inverted"
                    onClick={() => setEmbargo(null, 18)}
                  >
                    18 months
                  </Button>
                </Col>
              </Row>

              <Row className="show-grid">
                <Col xs={12} md={12} className="embargo-picker">
                  <DatePicker
                    customInput={
                      <ButtonInput
                        cssClassName="btn btn-secondary btn-block btn-light-blue"
                        iconClassName="fa fa-calendar"
                        text="Set Embargo"
                      />
                    }
                    inline
                    selected={this.state.embargoDate}
                    onChange={setEmbargo}
                    dateFormat="MMMM d, yyyy"
                    maxDate={latestEmbargoDate}
                    minDate={earliestEmbargoDate}
                  />
                </Col>
              </Row>
            </Container>
          </Modal.Body>

          <Modal.Footer className="embargo-footer">
            <Container>
              <Row className="show-grid">
                <Col xs={6} md={6}>
                  <Button
                    variant="secondary"
                    className="btn-sm btn-block btn-green-inverted"
                    onClick={() => {
                      this.props.setEmbargoDate(this.state.embargoDate);
                      this.props.closeEmbargoDialog();
                    }}
                  >
                    Accept
                  </Button>
                </Col>
                <Col xs={6} md={6}>
                  <Button
                    variant="secondary"
                    className="btn-sm btn-block btn-red-inverted"
                    onClick={this.props.closeEmbargoDialog}
                  >
                    Cancel
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
  setEmbargoDate: PropTypes.func.isRequired,
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
    setEmbargoDate: date => dispatch(setEmbargoDate(date)),
    openEmbargoDialog: () => dispatch(showEmbargoDialog()),
    closeEmbargoDialog: () => dispatch(closeEmbargoDialog()),
    setEmbargoPeriod: months =>
      dispatch(
        setEmbargoDate(new Date().setMonth(new Date().getMonth() + months)),
      ),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(EmbargoDatePicker);

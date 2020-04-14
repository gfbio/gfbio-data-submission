/**
 *
 * EmbargoDatePicker
 *
 */

import React from 'react';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
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
  setFormChanged,
} from '../../containers/SubmissionForm/actions';
import {
  makeSelectEmbargoDate,
  makeSelectShowEmbargoDialog,
} from '../../containers/SubmissionForm/selectors';
import ButtonInput from './ButtonInput';

class EmbargoDatePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      embargoDate: new Date(this.props.embargoDate),
      embargoOriginal: new Date(this.props.embargoDate),
      updated: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // as props.embargoDate come later, we need to update the state
    // this will only happen once after the data was loaded from the server
    if (
      !this.state.updated &&
      prevState.embargoDate instanceof Date &&
      prevState.embargoDate.setHours(0, 0, 0, 0) !==
        new Date(this.props.embargoDate).setHours(0, 0, 0, 0)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(() => ({
        embargoDate: this.props.embargoDate,
        embargoOriginal: new Date(this.props.embargoDate),
        updated: true,
      }));
    }
  }

  showEmbargoButton = () => {
    // Do not show button if at least one PID has status PUBLIC
    if (this.props.accessionId && this.props.accessionId.length !== 0) {
      let showButton = true;
      // if at least 1 PID has status PUBLIC do not show button
      this.props.accessionId.forEach(accession => {
        if (accession.status === 'PUBLIC') showButton = false;
      });
      if (!showButton)
        return <p className="text-center">Your data is already public</p>;
    }

    return (
      <div>
        <p className="text-center">
          <h4>{dateFormat(this.props.embargoDate, 'dd mmmm yyyy')}</h4>
        </p>
        <Button
          variant="link"
          className="btn-block btn-link-light-blue embargo-btn"
          onClick={this.props.openEmbargoDialog}
        >
          <i className="icon ion-md-calendar align-top" />
          <span className="">Change embargo date</span>
        </Button>
      </div>
    );
  };

  showReleaseEmbargoButton = () => {
    if (this.props.accessionId && this.props.accessionId.length === 0) {
      return null;
    }
    if (this.props.accessionId && this.props.accessionId.length !== 0) {
      // if at least 1 PID has status PUBLIC do not show button
      let showButton = true;
      this.props.accessionId.forEach(accession => {
        if (accession.status === 'PUBLIC') showButton = false;
      });
      if (!showButton) return null;
      // show button
      const earliestEmbargoDate = new Date().setDate(new Date().getDate() + 1);
      return (
        <Button
          variant="link"
          className="btn-block btn-link-light-blue embargo-btn"
          onClick={() => {
            this.props.setFormChanged(true);
            this.props.setEmbargoDate(earliestEmbargoDate);
          }}
        >
          <i className="fa fa-calendar-check-o align-top" />
          <span className="">Release tomorrow</span>
        </Button>
      );
    }
    return null;
  };

  render() {
    const setEmbargo = (date, months) => {
      if (date) {
        this.setState(prevState => ({
          ...prevState,
          embargoDate: date,
        }));
      } else {
        this.setState(prevState => ({
          ...prevState,
          embargoDate: new Date().setMonth(new Date().getMonth() + months),
        }));
      }
    };
    const earliestEmbargoDate = new Date().setDate(new Date().getDate() + 1);
    const latestEmbargoDate = new Date().setMonth(new Date().getMonth() + 24);
    const updateGlobalEmbargo = () => {
      // set form changed status
      if (
        this.state.embargoOriginal.setHours(0, 0, 0, 0) ===
        this.state.embargoDate.setHours(0, 0, 0, 0)
      ) {
        this.props.setFormChanged(false);
      } else {
        this.props.setFormChanged(true);
      }
      this.props.setEmbargoDate(this.state.embargoDate);
    };
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Embargo Date</h2>
          <p className="section-subtitle" />
        </header>

        {this.showEmbargoButton()}
        {this.showReleaseEmbargoButton()}

        <Modal
          show={this.props.showEmbargoDialog}
          onHide={this.props.closeEmbargoDialog}
          onShow={() => {
            this.setState(prevState => ({
              ...prevState,
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
                      updateGlobalEmbargo();
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
  showEmbargoDialog: PropTypes.bool,
  openEmbargoDialog: PropTypes.func,
  closeEmbargoDialog: PropTypes.func,
  accessionId: PropTypes.array,
  setFormChanged: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  embargoDate: makeSelectEmbargoDate(),
  showEmbargoDialog: makeSelectShowEmbargoDialog(),
});

function mapDispatchToProps(dispatch) {
  return {
    setFormChanged: changed => dispatch(setFormChanged(changed)),
    setEmbargoDate: date => dispatch(setEmbargoDate(date)),
    openEmbargoDialog: () => dispatch(showEmbargoDialog()),
    closeEmbargoDialog: () => dispatch(closeEmbargoDialog()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(EmbargoDatePicker);

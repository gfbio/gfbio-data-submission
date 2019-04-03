/**
 *
 * DatasetLabelForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectCurrentLabel,
  makeSelectDatasetLabels,
} from '../../containers/SubmissionForm/selectors';
import {
  addDatasetLabel,
  changeCurrentLabel,
  removeDatsetLabel,
} from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class DatasetLabelForm extends React.PureComponent {

  handleChange = (e) => {
    this.props.handleChange(e.target.value);
  };

  render() {
    console.log('DatasetLabelForm render');
    console.log(this.props);
    console.log('----------------------');
    console.log(this.state);
    console.log('---------------------------------');
    const labelList = this.props.datasetLabels.map((label, index) => {
      if (label !== '') {
        return <li key={index}
                   className="list-group-item d-flex justify-content-between align-items-center publication">
          <span><i className="fa fa-tags pub" /> {label} </span>
          <button className="btn btn-remove" onClick={(e) => {
            e.preventDefault();
            this.props.handleRemove(index);
          }}>
            <i className="fa fa-times" />
            Remove
          </button>
        </li>;
      }
    });

    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Labels</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <ul className="list-group list-group-flush">
          {labelList}
        </ul>
        <div className="form-row">
          <div className="form-group col-md-10">
            <input className="form-control" type="text"
                   id="relatedPublication"
                   value={this.props.currentLabel}
                   placeholder="Add Lables to your Dataset"
                   onChange={this.handleChange}
            />
          </div>
          <div className="form-group col-md-2">
            <a
              className="btn btn-secondary btn-block
              btn-light-blue-inverted"
              onClick={e => {
                e.preventDefault();
                this.props.handleAdd(this.props.currentLabel);
              }}

            >
              Add
            </a>
          </div>
        </div>
      </div>
    );
  }
}

DatasetLabelForm.propTypes = {
  currentLabel: PropTypes.string,
  datasetLabels: PropTypes.array,
  handleAdd: PropTypes.func,
  handleRemove: PropTypes.func,
  handleChange: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  datasetLabels: makeSelectDatasetLabels(),
  currentLabel: makeSelectCurrentLabel(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleAdd: value => dispatch(addDatasetLabel(value)),
    handleChange: value => dispatch(changeCurrentLabel(value)),
    handleRemove: index => dispatch(removeDatsetLabel(index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(DatasetLabelForm);

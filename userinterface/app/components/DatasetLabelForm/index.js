/**
 *
 * DatasetLabelForm
 *
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { createStructuredSelector } from 'reselect';
import {
  addDatasetLabel,
  changeCurrentLabel,
  removeDatsetLabel,
} from '../../containers/SubmissionForm/actions';
import {
  makeSelectCurrentLabel,
  makeSelectDatasetLabels,
} from '../../containers/SubmissionForm/selectors';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class DatasetLabelForm extends React.PureComponent {
  handleChange = e => {
    this.props.handleChange(e.target.value);
  };

  render() {
    // Deal with legacy submissions where no datasetlabels were existing
    let datasetLabels = [];
    if (this.props.dataset_labels !== undefined) {
      datasetLabels = this.props.dataset_labels;
    }
    const labelList = datasetLabels.map((label, index) => {
      if (label !== '') {
        let liClassNames =
          'list-group-item d-flex justify-content-between align-items-center publication';
        if (this.props.readOnly) {
          liClassNames += ' disabled';
        }
        const removeButton = this.props.readOnly ? (
          ''
        ) : (
          <button
            className="btn btn-remove"
            onClick={e => {
              e.preventDefault();
              this.props.handleRemove(index);
            }}
          >
            <i className="fa fa-times"/>
            Remove
          </button>
        );

        return (
          <li
            key={index}
            className={liClassNames}
          >
            <span>
              <i className="fa fa-tags pub"/> {label}{' '}
            </span>
            {removeButton}
          </li>
        );
      }
    });

    let linkClasses = 'btn btn-secondary w-100 btn-light-blue-inverted';
    if (this.props.readOnly) {
      linkClasses += ' disabled';
    }

    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Labels</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <ul className="list-group list-group-flush">{labelList}</ul>
        <div className="row">
          <div className="form-group col-md-10">
            <input
              className="form-control"
              type="text"
              id="dataSetLabel"
              value={this.props.currentLabel}
              placeholder="Add Labels to your Dataset"
              onChange={this.handleChange}
              disabled={this.props.readOnly}
            />
          </div>
          <div className="form-group col-md-2">
            <a
              className={linkClasses}
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
  dataset_labels: PropTypes.array,
  handleAdd: PropTypes.func,
  handleRemove: PropTypes.func,
  handleChange: PropTypes.func,
  readOnly: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  dataset_labels: makeSelectDatasetLabels(),
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

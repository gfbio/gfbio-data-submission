/**
 *
 * DatasetLabelForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
  makeSelectCurrentLabel,
  makeSelectDatasetLabels,
} from '../../containers/SubmissionForm/selectors';
import {
  addDatasetLabel,
  changeCurrentLabel,
  removeDatsetLabel,
} from '../../containers/SubmissionForm/actions';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class DatasetLabelForm extends React.PureComponent {
  handleChange = e => {
    this.props.handleChange(e.target.value);
  };

  render() {
    // console.log('DatasetLabelForm render');
    // console.log(this.props);
    // console.log('----------------------');
    // console.log(this.state);
    // console.log('---------------------------------');
    const labelList = this.props.dataset_labels.map((label, index) => {
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
            <i className="fa fa-times" />
            Remove
          </button>
        );

        return (
          <li
            key={index}
            className={liClassNames}
          >
            <span>
              <i className="fa fa-tags pub" /> {label}{' '}
            </span>
            {removeButton}
          </li>
        );
      }
    });

    let linkClasses = 'btn btn-secondary btn-block btn-light-blue-inverted';
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
        <div className="form-row">
          <div className="form-group col-md-10">
            <input
              className="form-control"
              type="text"
              id="relatedPublication"
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

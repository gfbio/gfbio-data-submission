/**
 *
 * RelatedPublicationsForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
  makeSelectCurrentRelatedPublication,
  makeSelectRelatedPublications,
} from '../../containers/SubmissionForm/selectors';
import {
  addRelatedPublication,
  changeCurrentRelatedPublication,
  removeRelatedPublication,
} from '../../containers/SubmissionForm/actions';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class RelatedPublicationsForm extends React.PureComponent {
  handleChange = e => {
    this.props.handleChange(e.target.value);
  };

  render() {
    const publicationList = this.props.relatedPublications.map((pub, index) => {
      if (pub !== '') {
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
              <i className="icon ion-md-paper pub" /> {pub}
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
          <h2 className="section-title">Related Publications </h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <ul className="list-group list-group-flush">{publicationList}</ul>
        <div className="form-row">
          <div className="form-group col-md-10">
            <input
              className="form-control"
              type="text"
              id="relatedPublication"
              value={this.props.currentRelatedPublication}
              placeholder="Enter a full citation or a DOI"
              onChange={this.handleChange}
              disabled={this.props.readOnly}
            />
          </div>
          <div className="form-group col-md-2">
            <a
              className={linkClasses}
              onClick={e => {
                e.preventDefault();
                this.props.handleAdd(this.props.currentRelatedPublication);
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

RelatedPublicationsForm.propTypes = {
  currentRelatedPublication: PropTypes.string,
  relatedPublications: PropTypes.array,
  handleAdd: PropTypes.func,
  handleRemove: PropTypes.func,
  handleChange: PropTypes.func,
  readOnly: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  relatedPublications: makeSelectRelatedPublications(),
  currentRelatedPublication: makeSelectCurrentRelatedPublication(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleAdd: value => dispatch(addRelatedPublication(value)),
    handleChange: value => dispatch(changeCurrentRelatedPublication(value)),
    handleRemove: index => dispatch(removeRelatedPublication(index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(RelatedPublicationsForm);

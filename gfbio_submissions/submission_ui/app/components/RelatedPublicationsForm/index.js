/**
 *
 * RelatedPublicationsForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectCurrentRelatedPublication,
  makeSelectRelatedPublications,
} from '../../containers/SubmissionForm/selectors';
import {
  addRelatedPublication,
  changeCurrentRelatedPublication,
  removeRelatedPublication,
} from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class RelatedPublicationsForm extends React.PureComponent {

  // localstate to keep track of just the value in input field
  // constructor() {
  //   super();
  //   this.state = {
  //     publicationValue: '',
  //   };
  // }

  handleChange = (e) => {
    // this.setState({ publicationValue: e.target.value });
    this.props.handleChange(e.target.value);
  };

  render() {
    console.log(this.props);
    /*

    schemaListElements = this.schemaList.map(schema => (
    <li className="list-group-item" key={schema.replace(/ /g, '')}>
      <button
        className="btn btn-primary btn-block btn-license text-left"
        type="button"
        data-toggle="collapse show"
        data-target="#collapseMetaData"
        aria-expanded="false"
        aria-controls="collapseMetaData"
        onClick={() => this.props.onClickMetaDataSchema(schema)}
      >
        {schema}
        <a
          className="license-link align-bottom"
          href={`link_to_details_of_${schema}`}
        >
          details
        </a>
      </button>
    </li>
  ));

    */

    const publicationList = this.props.relatedPublications.map((pub, index) => {
      if (pub !== '') {
        return <li key={index}
                   className="list-group-item d-flex justify-content-between align-items-center publication">
          {pub}
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
          <h2 className="section-title">Related Publications </h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <ul className="list-group list-group-flush">
          {publicationList}
        </ul>
        <div className="form-row">
          <div className="form-group col-md-10">
            <input className="form-control" type="text"
                   id="relatedPublication"
                   placeholder="Enter a publication or reference"
                   onChange={this.handleChange}
            />
          </div>
          <div className="form-group col-md-2">
            <a
              className="btn btn-secondary btn-block
              btn-light-blue-inverted"
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
// redux-form captures its own onchange etc, button triggers my own action
// RelatedPublicationsForm = compose(withConnect)(RelatedPublicationsForm);
// export default reduxForm({ form: 'publicationForm' })(RelatedPublicationsForm);

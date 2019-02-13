/**
 *
 * MetaDataSchemaForm
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { connect } from 'react-redux';
import injectReducer from 'utils/injectReducer';
import { compose } from 'redux';
import reducer from '../../containers/SubmissionForm/reducer';
import { makeSelectMetaDataSchema } from '../../containers/SubmissionForm/selectors';
import { changeMetaDataSchema } from '../../containers/SubmissionForm/actions';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class MetaDataSchemaForm extends React.PureComponent {
  schemaList = [
    'None',
    'ABCD 2.06',
    'DwC 2013-10-25',
    'DC 1.1',
    'EDM 5.2.3',
    'EML 2.1.1',
    'ESE 3.4.1',
    'INSPIRE Directive 2007/2/EC',
    'ISO 19115-1 2014',
    'GPLv2',
    'MIxS 4.0',
  ];

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

  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Metadata Schema</h2>
          <p className="section-subtitle" />
        </header>
        <div className="form-group accordion-form-content">
          <button
            className="btn btn-primary btn-block btn-license text-left"
            type="button"
            data-toggle="collapse"
            data-target="#collapseMetaData"
            aria-expanded="false"
            aria-controls="collapseMetaData"
          >
            <i className="fa fa-code" />
            {this.props.metaDataSchema}
            <p className="align-bottom">change</p>
          </button>

          <div className="collapse" id="collapseMetaData">
            <div className="card card-body">
              <ul className="list-group">{this.schemaListElements}</ul>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MetaDataSchemaForm.propTypes = {
  onClickMetaDataSchema: PropTypes.func,
  metaDataSchema: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  metaDataSchema: makeSelectMetaDataSchema(),
});

function mapDispatchToProps(dispatch) {
  return {
    onClickMetaDataSchema: metaDataSchema =>
      dispatch(changeMetaDataSchema(metaDataSchema)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);
const withReducer = injectReducer({ key: 'submissionForm', reducer });

export default compose(
  withReducer,
  withConnect,
)(MetaDataSchemaForm);
// export default MetaDataSchemaForm;

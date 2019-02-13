/**
 *
 * TargetDataCenterForm
 *
 */

import React from 'react';
import { Field } from 'redux-form/immutable';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class TargetDataCenterForm extends React.PureComponent {
  renderDataCenterSelector = ({ input, meta: { touched, error } }) => (
    <div className="form-group">
      <select className="form-control" {...input}>
        <option />
        <option>ENA – European Nucleotide Archive</option>
        <option>
          PANGAEA – Data Publisher for Earth & Environmental Science
        </option>
        <option>Data Centers at Natural Science Collections</option>
        <option>
          BGBM – Botanic Garden and Botanical Museum Berlin, Freie Universität
          Berlin
        </option>
        <option>
          DSMZ – Leibniz Institute DSMZ – German Collection of Microorganisms
          and Cell Cultures, Braunschweig
        </option>
        <option>
          MfN – Leibniz Institute for Research on Evolution and Biodiversity,
          Berlin
        </option>
        <option>
          SGN – Senckenberg Gesellschaft für Naturforschung – Leibniz Institute,
          Frankfurt
        </option>
        <option>SMNS – State Museum of Natural History Stuttgart</option>
        <option>
          SNSB – Staatliche Naturwissenschaftliche Sammlungen Bayerns – SNSB IT
          Center, München
        </option>
        <option>
          ZFMK – Zoological Research Museum Alexander Koenig – Leibniz Institute
          for Animal Biodiversity, Bonn
        </option>
      </select>
      {touched && error && <span>{error}</span>}
    </div>
  );

  // TODO:  Maybe a connection to store/reducer is needed
  // TODO: get List of Datacenters dynamically
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Target Datacenter</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <Field name="dataCenter" component={this.renderDataCenterSelector} />
      </div>
    );
  }
}

TargetDataCenterForm.propTypes = {};

export default TargetDataCenterForm;

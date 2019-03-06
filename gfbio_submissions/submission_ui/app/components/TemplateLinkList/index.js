/**
 *
 * TemplateLinkList
 *
 */

import React from 'react';
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class TemplateLinkList extends React.PureComponent {
  render() {
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Metadata Templates</h2>
        </header>
        <ul>
          <li>
            <a href="" target="_blank"></a>
          </li>
          <li>
            <a href="" target="_blank"></a>
          </li>
          <li>
            <a href="" target="_blank"></a>
          </li>
        </ul>
      </div>
    );
  }
}

TemplateLinkList.propTypes = {};

export default TemplateLinkList;

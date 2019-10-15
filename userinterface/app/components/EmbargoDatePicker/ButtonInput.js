/**
 *
 * ButtonDatePicker
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

/* eslint-disable react/prefer-stateless-function */
class ButtonInput extends React.Component {
  render() {
    return (
      <button
        type="button"
        className={this.props.cssClassName}
        onClick={this.props.onClick}
      >
        <i className={this.props.iconClassName} />
        {this.props.text}
      </button>
    );
  }
}

ButtonInput.propTypes = {
  onClick: PropTypes.func,
  cssClassName: PropTypes.string,
  iconClassName: PropTypes.string,
  text: PropTypes.string,
};

export default ButtonInput;

/**
 *
 * SubmitFormSection
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class SubmitFormSection extends React.PureComponent {
  render() {
    return (
      <div className="form-row mt-5">
        <div className="form-group col-md-4">
          <button
            type="submit"
            className="btn btn-secondary btn-block btn-light-blue"
            // onClick={() => this.props.onSave('remoteSubmit')}
            onClick={this.props.handleSubmit(values =>
              this.props.onSubmit({
                ...values,
                pill: 'blue',
              }),
            )}
          >
            <i className="fa fa-clipboard" />
            Save
          </button>
        </div>
        <div className="form-group col-md-4">
          <button
            type="button"
            className="btn btn-secondary btn-block btn-light-blue"
          >
            <i className="fa fa-calendar" />
            Set Embargo
          </button>
        </div>
        <div className="form-group col-md-4">
          <button type="submit" className="btn btn-secondary btn-block green">
            <i className="fa fa-play" />
            Submit
          </button>
        </div>
      </div>
    );
  }
}

SubmitFormSection.propTypes = {
  onSave: PropTypes.func,
  handleSubmit: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default SubmitFormSection;

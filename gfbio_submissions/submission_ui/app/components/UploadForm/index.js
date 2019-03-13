/**
 *
 * UploadForm
 *
 */

import React from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { makeSelectFileUploads } from '../../containers/SubmissionForm/selectors';
import { addFileUpload } from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
// import styled from 'styled-components';

/* eslint-disable react/prefer-stateless-function */
class UploadForm extends React.PureComponent {

  onDrop = (acceptedFiles, rejectedFiles) => {
    console.log('DrOP');
    console.log('acceptedFiles');
    // TODO: accepted files will become list of files scheduled for upload, remove etc
    console.log(acceptedFiles);
    console.log('rejectedFiles');
    console.log(rejectedFiles);
    this.props.handleDrop(acceptedFiles);
  };

  render() {

    console.log('UPLOAD FORM RENDER: fileUploads');
    console.log(this.props.fileUploads);
    console.log('--------------------------');
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Upload Data</h2>
          <p className="section-subtitle">(optional)</p>
        </header>
        <div className="form-group">
          <Dropzone onDrop={this.onDrop}>
            {({ getRootProps, getInputProps, isDragActive }) => (
              <div
                {...getRootProps()}
                className={classNames('dropzone', {
                  'dropzone--isActive': isDragActive,
                })}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p>Drop files here...</p>
                ) : (
                  <p>
                    Try <b>dropping</b> some files here, or <b>click</b> to
                    select files to upload.
                  </p>
                )}
              </div>
            )}
          </Dropzone>
        </div>
      </div>
    );
  }
}

UploadForm.propTypes = {
  fileUploads: PropTypes.array,
  handleDrop: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleDrop: value => dispatch(addFileUpload(value)),
    // handleChange: value => dispatch(changeCurrentRelatedPublication(value)),
    // handleRemove: index => dispatch(removeRelatedPublication(index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(UploadForm);


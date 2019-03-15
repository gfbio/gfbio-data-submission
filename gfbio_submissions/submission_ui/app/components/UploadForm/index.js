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
import { addFileUpload } from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import FileIndicator from './FileIndicator';
// import shortid from 'shortid';

/* eslint-disable react/prefer-stateless-function */
class UploadForm extends React.PureComponent {

  onDrop = (acceptedFiles, rejectedFiles) => {
    // // TODO: accepted files will become list of files scheduled for upload, remove etc
    this.props.handleDrop(acceptedFiles);
  };

  render() {

    // console.log('UPLOAD FORM RENDER: fileUploads');
    // console.log(this.props);
    // console.log('--------------------------');

    // TODO: needs different styling
    // TODO: needs different position
    // TODO: accordion style for no. of file over X ?

    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Upload Data</h2>
          <p className="section-subtitle">(optional)</p>
        </header>

        <FileIndicator />

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
  handleDrop: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({});

function mapDispatchToProps(dispatch) {
  return {
    handleDrop: value => dispatch(addFileUpload(value)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(UploadForm);


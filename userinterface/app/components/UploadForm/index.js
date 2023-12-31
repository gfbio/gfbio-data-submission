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
import {
  addFileUpload, dismissShowUplaodLimit,
  showUplaodLimit,
} from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import FileIndicator from './FileIndicator';
import shortid from 'shortid';
import {
  makeSelectFileUploads, makeSelectFileUploadsFromServer,
  makeSelectShowUploadLimitMessage,
} from '../../containers/SubmissionForm/selectors';
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from '../../globalConstants';
import UploadMessage from './uploadMessage';

/* eslint-disable react/prefer-stateless-function */
class UploadForm extends React.PureComponent {

  matchingUploadLimit = (acceptedFiles = []) => {
    let tmpTotalSize = 0;
    for (let a of acceptedFiles) {
      tmpTotalSize += a.size;
    }
    let uploadedTotalSize = 0;
    for (let l of this.props.fileUploads) {
      uploadedTotalSize += l.file.size;
    }
    let serverFilesTotalSize = 0;
    for (let f of this.props.fileUploadsFromServer) {
      serverFilesTotalSize += f.file_size;
    }

    let fileUploadsFromServerLength = 0;
    if (this.props.fileUploadsFromServer.length !== undefined) {
      fileUploadsFromServerLength = this.props.fileUploadsFromServer.length;
    }
    if ((tmpTotalSize + uploadedTotalSize + serverFilesTotalSize) <= MAX_TOTAL_UPLOAD_SIZE
      && (acceptedFiles.length + this.props.fileUploads.size +
        fileUploadsFromServerLength) <= MAX_UPLOAD_ITEMS) {
      this.props.dismissShowUploadLimit();
      return true;
    } else {
      this.props.showUploadLimit();
      return false;
    }
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    if (this.props.readOnly) {
      return;
    }
    // // TODO: accepted files will become list of files scheduled for upload, remove etc
    let tmp = [];
    for (let a of acceptedFiles) {
      tmp.push({
        id: shortid.generate(),
        progress: 0,
        file: a,
        status: 'pending', // 'success' 'error' 'uploading'
        metaData: false,
        messages: {},
      });
    }
    // if (this.matchingUploadLimit(acceptedFiles)) {
    this.props.handleDrop(tmp);
    // }

  };

  render() {


    // TODO: needs different styling
    // TODO: needs different position
    // TODO: accordion style for no. of file over X ?
    this.matchingUploadLimit();

    const dragDropText = () => {
      if (this.props.readOnly) {
        return (
          <p>
            No uploads allowed on <b>CLOSED</b> submission
          </p>
        );
      }
      ;
      return (
        <p>
          Try <b>dropping</b> some files here, or <b>click</b> to select files
          to upload.
        </p>);
    };

    const message = UploadMessage(this.props.showUploadLimitMessage, this.props.dismissShowUploadLimit);
    return (
      <div>
        <header className="header header-left form-header-top">
          <h2 className="section-title">Upload Data</h2>
          <p className="section-subtitle">(optional)</p>
        </header>

        <FileIndicator/>

        {message}

        <div
          className={this.props.readOnly ? 'form-group disabled' : 'form-group'}
        >
          <Dropzone
            onDrop={this.onDrop}
            multiple={true}
            disabled={this.props.readOnly}
          >
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
                  dragDropText()
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
  fileUploads: PropTypes.array,
  fileUploadsFromServer: PropTypes.object,
  showUploadLimit: PropTypes.func,
  dismissShowUploadLimit: PropTypes.func,
  showUploadLimitMessage: PropTypes.bool,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
  showUploadLimitMessage: makeSelectShowUploadLimitMessage(),
  fileUploadsFromServer: makeSelectFileUploadsFromServer(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleDrop: value => dispatch(addFileUpload(value)),
    showUploadLimit: () => dispatch(showUplaodLimit()),
    dismissShowUploadLimit: () => dispatch(dismissShowUplaodLimit()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(UploadForm);


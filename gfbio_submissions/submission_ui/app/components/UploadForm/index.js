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
  addFileUpload,
  showUplaodLimit,
} from '../../containers/SubmissionForm/actions';
import { connect } from 'react-redux';
import { compose } from 'redux';
import FileIndicator from './FileIndicator';
import shortid from 'shortid';
import { makeSelectFileUploads } from '../../containers/SubmissionForm/selectors';
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from '../../globalConstants';

/* eslint-disable react/prefer-stateless-function */
class UploadForm extends React.PureComponent {

  onDrop = (acceptedFiles, rejectedFiles) => {
    // // TODO: accepted files will become list of files scheduled for upload, remove etc
    let tmp = [];
    console.log('droped files size: ');
    // 200 MB in bytes, 20 files max
    // 200000000
    let tmpTotalSize = 0;
    // let tmpFileCount = 0;
    for (let a of acceptedFiles) {
      // console.log(' -- ' + a.size);
      tmpTotalSize += a.size;
      tmp.push({
        id: shortid.generate(),
        progress: 0,
        file: a,
        status: 'pending', // 'success' 'error' 'uploading'
        messages: {},
      });
    }
    console.log(tmp);
    console.log(this.props.fileUploads);
    let uploadedTotalSize = 0;
    for (let l of this.props.fileUploads) {
      // console.log(l.file.size);
      uploadedTotalSize += l.file.size;
    }
    console.log('tmpTotalSize ' + tmpTotalSize);
    console.log('uploadedTotalSize ' + uploadedTotalSize);
    console.log('both ' + (tmpTotalSize + uploadedTotalSize));
    console.log('no of all ' + (tmp.length + this.props.fileUploads.size));
    console.log((tmpTotalSize + uploadedTotalSize) <= MAX_TOTAL_UPLOAD_SIZE);
    console.log((tmp.length + this.props.fileUploads.size) <= MAX_UPLOAD_ITEMS);
    // TODO: consider that if 19 files are registered, adding 2 more will not take place
    //        although
    if ((tmpTotalSize + uploadedTotalSize) <= MAX_TOTAL_UPLOAD_SIZE
      && (tmp.length + this.props.fileUploads.size) <= MAX_UPLOAD_ITEMS) {
      // TODO: remove upload limit warning
      this.props.handleDrop(tmp);
    }
    else {
      //TODO: add message to inform about limits
      //        --> reducer var true/false if message is displayed
      //        --> is there  something already available for react dropzone ?
      //
      this.props.showUploadLimit();
    }
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
          <Dropzone
            onDrop={this.onDrop}
            multiple={true}
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
  fileUploads: PropTypes.array,
  showUploadLimit: PropTypes.func
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleDrop: value => dispatch(addFileUpload(value)),
    showUploadLimit: () => dispatch(showUplaodLimit()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(UploadForm);


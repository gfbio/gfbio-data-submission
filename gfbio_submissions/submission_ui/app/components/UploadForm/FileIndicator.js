import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectFileUploads,
  makeSelectFileUploadsFromServer,
  makeSelectMetaDataIndex,
  makeSelectMetaFileName,
} from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
  deleteFile,
  removeFileUpload,
  setMetaDataIndex,
  setMetaDataOnServer,
} from '../../containers/SubmissionForm/actions';
import filesize from 'filesize';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

class FileIndicator extends React.Component {

  constructor(props) {
    super(props);
    this.handleMetadataSelect = this.handleMetadataSelect.bind(this);
  }

  handleMetadataSelect(event, file = {}) {
    if (event.target.value.indexOf('uploaded_') > -1) {
      this.props.changeMetaDataOnServer(event.target.value, file);
    } else {
      this.props.changeMetaDataIndex(event.target.value);
    }
  }

  createUploadedListElements() {
    console.log('createUploadedListElements');
    const uploaded = this.props.fileUploadsFromServer.map((uploaded, index) => {
      let metaDataCheckButton = (
        <small className="file-name">
          <input
            type="checkbox"
            id={`primaryUploaded${index}`}
            value={`uploaded_${index}`}
            // onChange={this.handleMetadataSelect}
            onChange={(e) => {
              // e.preventDefault();
              console.log(e);
              console.log(uploaded.pk);
              this.handleMetadataSelect(e, uploaded);
            }}
            checked={uploaded.meta_data}
          />
          <label htmlFor={`primaryUploaded${index}`}
                 className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {uploaded.file_name}
        </small>
      );
      return <li
        key={index}
        className={'list-group-item file-upload success'}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {metaDataCheckButton}
          </div>
          <div>
            <small className="mr-5 file-size">
              {filesize(uploaded.file_size)}
            </small>
            <a className="btn btn-download mr-3" href={uploaded.file}>
              <i className="icon ion-md-download"></i>
            </a>
            <button className="btn btn-remove" onClick={(e) => {
              e.preventDefault();
              this.props.deleteFile(uploaded.pk);
            }}>
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </li>;
    });
    return uploaded;
  }


  createScheduledUploadListElements() {
    console.log('createSCHEDULEDListElements');
    const fileListElements = this.props.fileUploads.map((upload, index) => {
      let progressStyle = {
        width: `${upload.progress}%`,
      };
      let metaDataCheckButton = (
        <small className="file-name">
          <input
            type="checkbox"
            id={`primary${index}`}
            value={index}
            onChange={this.handleMetadataSelect}
            checked={upload.metaData}
          />
          <label htmlFor={`primary${index}`}
                 className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {upload.file.name}
        </small>
      );
      return <li
        key={index}
        className={'list-group-item file-upload ' + upload.status}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            {metaDataCheckButton}
          </div>
          <div>
            <small className="mr-5 file-size">
              {filesize(upload.file.size)}
            </small>
            <span className="pr-4 mr-3"></span>
            <button className="btn btn-remove" onClick={(e) => {
              e.preventDefault();
              this.props.handleRemove(index);
            }}>
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div className="progress">
          <div className="progress-bar" role="progressbar" style={progressStyle}
               aria-valuenow={`${upload.progress}`} aria-valuemin="0"
               aria-valuemax="100"></div>
        </div>

      </li>;
    });
    return fileListElements;
  }

  render() {
    // console.log('FileIndicator render props');
    // console.log(this.props);
    // console.log('--------------------------------');

    const uploadedFileListElement = this.createUploadedListElements();
    const fileListElements = this.createScheduledUploadListElements();

    let listHeader = null;
    if (fileListElements.size > 0 || this.props.fileUploadsFromServer.length > 0) {
      listHeader = <li className="list-group-item file-upload mb-3">

        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id="tooltip-right">
              select the primary metadata file, e.g. metadata
              template
            </Tooltip>
          }
        >
              <span className="upload-header">
                Metadata
                <i
                  className="icon ion-ios-help-circle-outline help align-bottom"
                  aria-hidden="true"></i>
              </span>
        </OverlayTrigger>
      </li>;
    }

    return (
      <ul className="list-group list-group-flush">
        {listHeader}
        {uploadedFileListElement}
        {fileListElements}
      </ul>
    );
  }


}

FileIndicator.propTypes = {
  fileUploads: PropTypes.array,
  fileUploadsFromServer: PropTypes.object,
  metaDataIndex: PropTypes.string,
  // metaDataFileName: PropTypes.string,
  handleRemove: PropTypes.func,
  changeMetaDataIndex: PropTypes.func,
  changeMetaDataOnServer: PropTypes.func,
  deleteFile: PropTypes.func,
  // handleMetadataSelect: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
  fileUploadsFromServer: makeSelectFileUploadsFromServer(),
  metaDataIndex: makeSelectMetaDataIndex(),
  // metaDataFileName: makeSelectMetaFileName(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleRemove: index => dispatch(removeFileUpload(index)),
    changeMetaDataIndex: (index) =>
      dispatch(setMetaDataIndex(index)),
    changeMetaDataOnServer: (index, primaryKey) =>
      dispatch(setMetaDataOnServer(index, primaryKey)),
    deleteFile: fileKey => dispatch(deleteFile(fileKey)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(FileIndicator);


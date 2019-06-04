import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectFileUploads,
  makeSelectFileUploadsFromServer,
  makeSelectMetaDataIndex,
} from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
  deleteFile,
  removeFileUpload,
  setMetaDataIndex,
} from '../../containers/SubmissionForm/actions';
import filesize from 'filesize';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

class FileIndicator extends React.Component {

  constructor(props) {
    super(props);
    this.handleMetadataSelect = this.handleMetadataSelect.bind(this);
    // this.listIndex = -1;
    // this.incrementListIndex = this.incrementListIndex.bind(this);
    // this.getListIndex = this.getListIndex.bind(this);
  }

  // incrementListIndex() {
  //  this.props.incrementListIndex();
  // }

  // getListIndex() {
  //   return this.props.uploadListIndex;
  // }

  handleMetadataSelect(event) {
    // console.log('handleMetadataSelect: ' + event.target.value + '  -  ' + event.target.checked);
    // console.log(this.props.fileUploads.get(event.target.value));
    // click shows index and checkedvalue (after click[release])
    // if click and checked -> new metadata index
    // if click and not checked and equal metadataindex -> set index to -1
    // set all other field to display not checked

    // 1. if item is removed, set metadataindex to -1
    if (event.target.checked) {
      this.props.changeMetaDataIndex(event.target.value);
    } else if (!event.target.checked && event.target.value === this.props.metaDataIndex) {
      this.props.changeMetaDataIndex('');
    }
  }


  createUploadedListElements() {
    // console.log('createUploadedListElements');
    // console.log(this.props.uploadListIndex);
    const uploaded = this.props.fileUploadsFromServer.map((uploaded, index) => {

      let metaDataCheckButton = (
        <small className="file-name">
          <input
            type="checkbox"
            id={`primaryUploaded${index}`}
            value={`uploaded${index}`}
            onChange={this.handleMetadataSelect}
          />
          <label htmlFor={`primaryUploaded${index}`}
                 className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {uploaded.file_name}
        </small>
      );
      if (this.props.metaDataIndex === `uploaded${index}`) {
        metaDataCheckButton = (
          <small className="file-name">
            <input
              type="checkbox"
              id={`primaryUploaded${index}`}
              value={`uploaded${index}`}
              onChange={this.handleMetadataSelect}
              checked
            />
            <label htmlFor={`primaryUploaded${index}`}
                   className="metadata"></label>
            <i className="icon ion-md-document pub"></i>
            {uploaded.file_name}
          </small>
        );
      }

      // console.log('-- map index ' + index);
      // console.log('-- map elementIndex ' + elementIndex);
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
    // console.log('UPLOADED ');
    // console.log(uploaded);
    // console.log(uploaded.length);
    // this.props.setUploadListIndex(this.props.uploadListIndex + uploaded.length - 1);
    return uploaded;
  }


  createScheduledUploadListElements() {
    const fileListElements = this.props.fileUploads.map((upload, index) => {

      // this.incrementListIndex();
      // const index = this.getListIndex();

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
          />
          <label htmlFor={`primary${index}`}
                 className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {upload.file.name}
        </small>
      );
      if (this.props.metaDataIndex === `${index}`) {
        metaDataCheckButton = (
          <small className="file-name">
            <input
              type="checkbox"
              id={`primary${index}`}
              value={index}
              onChange={this.handleMetadataSelect}
              checked
            />
            <label htmlFor={`primary${index}`}
                   className="metadata"></label>
            <i className="icon ion-md-document pub"></i>
            {upload.file.name}
          </small>
        );
      }

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
            {/*<button className="btn btn-download mr-3">*/}
            {/*  <i className="icon ion-md-download"></i>*/}
            {/*</button>*/}
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

    // console.log('###########################');
    // console.log('list index');
    // console.log(this.getListIndex());
    const uploadedFileListElement = this.createUploadedListElements();
    // console.log(this.getListIndex());
    // console.log('alreade uploaded list');
    // for (let u of uploadedFileListElement) {
    //   console.log(u);
    // }

    const fileListElements = this.createScheduledUploadListElements();

    let listHeader = null;
    if (fileListElements.size > 0 || this.props.fileUploadsFromServer.length > 0) {
      listHeader = <li className="list-group-item file-upload mb-3">

        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id="tooltip-right">
              {/*Tooltip on <strong>RIGHT</strong>.*/}
              select <strong>meta-data</strong> (optional)
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
  handleRemove: PropTypes.func,
  changeMetaDataIndex: PropTypes.func,
  // uploadListIndex: PropTypes.number,
  // setUploadListIndex: PropTypes.func,
  deleteFile: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
  fileUploadsFromServer: makeSelectFileUploadsFromServer(),
  metaDataIndex: makeSelectMetaDataIndex(),
  // uploadListIndex: makeSelectUploadListIndex(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleRemove: index => dispatch(removeFileUpload(index)),
    changeMetaDataIndex: index => dispatch(setMetaDataIndex(index)),
    // setUploadListIndex: index => dispatch(setUploadListIndex(index)),
    deleteFile: fileKey => dispatch(deleteFile(fileKey)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(FileIndicator);


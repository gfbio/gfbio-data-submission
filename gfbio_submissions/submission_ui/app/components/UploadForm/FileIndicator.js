import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectFileUploads,
  makeSelectFileUploadsFromServer,
  makeSelectMetaDataIndex, makeSelectMetaFileName,
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

    console.log('**** handleMetadataSelect ***** ');
    // console.log(event);
    console.log('checked: ', event.target.checked); // true
    console.log('val: ', event.target.value);  // uploaded_2 new
    console.log('metaDataIndex:', this.props.metaDataIndex); // uploaded_4 old
    console.log('metaDataFileName: ', this.props.metaDataFileName); // ''
    console.log('parsed val: ', parseInt(event.target.value));
    console.log(this.props.fileUploads.get(parseInt(event.target.value)));
    const parsedIndex = parseInt(event.target.value);
    if (this.props.fileUploads.get(parsedIndex) !== undefined) {
      // TODO: reducer update or setIn action
      this.props.changeMetaDataIndex(event.target.value);
      // this.props.fileUploads.get(parsedIndex).metaData = true;
    }
    // console.log(this.props.fileUploads.get(parseInt(event.target.value)));

    /*if (event.target.checked) {
      // console.log('std check');
      this.props.changeMetaDataIndex(event.target.value);
    } else if (!event.target.checked && event.target.value === this.props.metaDataIndex) {
      // console.log('std de-check');
      this.props.changeMetaDataIndex('');
    }*/


    // else if (!event.target.checked && this.props.metaDataFileName !== '') {
    //   console.log('meta de-check');
    //   this.props.changeMetaDataIndex('');
    // }

    // TODO: evaluate if it is easier to store actual metaDataFilename in submission meta-data
    //  and deal with updates server-side. OR to get rid of these infos and do TODOs below

    // TODO: store if metadata in local file object
    // TODO: only one metadata file, thus reset others after selecting new
    // TODO: display checked or not depending on file.meta_data value
    // TODO: when uploading, also set metadata true/false in respective form value

    // TODO: for list from server, also show checked depending on meta_data value
    // TODO: update or reset meta_data value in both lists
    // TODO: when updating submission, update SubmissionUploads regarding metadata
    //  value - maybe file from new upload, maybe other already uploaded file
  }


  createUploadedListElements() {
    console.log('createUploadedListElements');
    // console.log(this.props.uploadListIndex);
    const uploaded = this.props.fileUploadsFromServer.map((uploaded, index) => {
      // console.log(' --  ' + uploaded.file_name + ' - ' + index + ' - ' + this.props.metaDataFileName + ' - ');
      // console.log('---------------------------');
      // console.log(uploaded.file_name);
      // console.log(this.props.metaDataFileName);
      // console.log(`primaryUploaded${index}`);
      // console.log(this.props.metaDataFileName === uploaded.file_name);
      let metaDataCheckButton = (
        <small className="file-name">
          <input
            type="checkbox"
            id={`primaryUploaded${index}`}
            value={`uploaded_${index}`}
            onChange={this.handleMetadataSelect}
            checked={false}
          />
          <label htmlFor={`primaryUploaded${index}`}
                 className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {uploaded.file_name}
        </small>
      );
      if (this.props.metaDataIndex === `uploaded_${index}` || this.props.metaDataFileName === uploaded.file_name) {
        metaDataCheckButton = (
          <small className="file-name">
            <input
              type="checkbox"
              id={`primaryUploaded${index}`}
              value={`uploaded_${index}`}
              onChange={this.handleMetadataSelect}
              checked={uploaded.meta_data}
            />
            <label htmlFor={`primaryUploaded${index}`}
                   className="metadata"></label>
            <i className="icon ion-md-document pub"></i>
            {uploaded.file_name}
          </small>
        );
      }
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
    console.log('createSCHEDULEDListElements');
    const fileListElements = this.props.fileUploads.map((upload, index) => {
      // console.log(' --  ' + upload.file.name + ' - ' + index);

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
            checked={upload.metaData}
          />
          <label htmlFor={`primary${index}`}
                 className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {upload.file.name}
        </small>
      );
      // if (this.props.metaDataIndex === `${index}`) {
      //   metaDataCheckButton = (
      //     <small className="file-name">
      //       <input
      //         type="checkbox"
      //         id={`primary${index}`}
      //         value={index}
      //         onChange={this.handleMetadataSelect}
      //         checked={true}
      //       />
      //       <label htmlFor={`primary${index}`}
      //              className="metadata"></label>
      //       <i className="icon ion-md-document pub"></i>
      //       {upload.file.name}
      //     </small>
      //   );
      // }

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

    const uploadedFileListElement = this.createUploadedListElements();

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
  metaDataFileName: PropTypes.string,
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
  metaDataFileName: makeSelectMetaFileName(),
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


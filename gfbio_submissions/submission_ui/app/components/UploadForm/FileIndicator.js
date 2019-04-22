import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectFileUploads,
  makeSelectMetaDataIndex,
} from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import {
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
  }

  handleMetadataSelect(event) {
    console.log(event.target.value + '  -  ' + event.target.checked);
    console.log(this.props.fileUploads.get(event.target.value));
    // click shows index and checkedvalue (after click[release])
    // if click and checked -> new metadata index
    // if click and not checked and equal metadataindex -> set index to -1
    // set all other field to display not checked
    if (event.target.checked) {
      this.props.changeMetaDataIndex(event.target.value);
    } else if (!event.target.checked && event.target.value === this.props.metaDataIndex) {
      this.props.changeMetaDataIndex('');
    }
  }

  render() {

    // console.log('FileIndicator render props');
    // console.log(this.props.fileUploads);
    // console.log('--------------------------------');

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
            <button className="btn btn-download mr-3">
              <i className="icon ion-md-download"></i>
            </button>
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

    let listHeader = null;
    if (fileListElements.size > 0) {
      listHeader = <li className="list-group-item file-upload mb-3">

        {/*<div className="d-flex justify-content-between align-items-center">*/}
        {/*  <div className="">*/}
        <OverlayTrigger
          placement="right"
          overlay={
            <Tooltip id="tooltip-right">
              Tooltip on <strong>RIGHT</strong>.
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
        {/*  </div>*/}
        {/*  <div>*/}
        {/*    <small className="mr-5 file-size">*/}
        {/*    </small>*/}
        {/*  </div>*/}
        {/*</div>*/}

      </li>;
    }

    return (
      <ul className="list-group list-group-flush">
        {listHeader}
        {fileListElements}
      </ul>
    );
  }


}

FileIndicator.propTypes = {
  fileUploads: PropTypes.array,
  metaDataIndex: PropTypes.string,
  handleRemove: PropTypes.func,
  changeMetaDataIndex: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
  metaDataIndex: makeSelectMetaDataIndex(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleRemove: index => dispatch(removeFileUpload(index)),
    changeMetaDataIndex: index => dispatch(setMetaDataIndex(index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(FileIndicator);


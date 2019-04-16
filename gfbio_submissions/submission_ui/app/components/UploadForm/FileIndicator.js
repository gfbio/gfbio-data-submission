import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { makeSelectFileUploads } from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { removeFileUpload } from '../../containers/SubmissionForm/actions';
import filesize from 'filesize';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

class FileIndicator extends React.Component {

  render() {

    // console.log('FileIndicator render props');
    // console.log(this.props.fileUploads);
    // console.log('--------------------------------');

    const fileListElements = this.props.fileUploads.map((upload, index) => {
      let progressStyle = {
        width: `${upload.progress}%`,
      };

      return <li
        key={index}
        className={'list-group-item file-upload ' + upload.status}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small className="file-name">
              <input
                type="checkbox"
                id={`primary${index}`}
                value={`primary${index}`}
              />
              <label htmlFor={`primary${index}`}
                     className="metadata pl-4 pr-4"></label>
              <i className="icon ion-md-document pub"></i>
              {upload.file.name}
            </small>
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
      listHeader = <li className="list-group-item  file-upload">
        <div className="d-flex justify-content-between align-items-center">
          <div className="">
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
                <i className="icon ion-ios-help-circle help align-bottom"
                   aria-hidden="true"></i>
              </span>
            </OverlayTrigger>
          </div>
          <div>
            <small className="mr-5 file-size">
            </small>
          </div>
        </div>
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
  handleRemove: PropTypes.func,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
});

function mapDispatchToProps(dispatch) {
  return {
    handleRemove: index => dispatch(removeFileUpload(index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(FileIndicator);


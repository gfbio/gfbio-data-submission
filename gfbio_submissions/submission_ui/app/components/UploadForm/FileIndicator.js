import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectFileUploadIndicators,
  makeSelectFileUploads,
} from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { removeFileUpload } from '../../containers/SubmissionForm/actions';

class FileIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log('FileIndicator render props');
    console.log(this.props);
    console.log('--------------------------------');
    return (
      <li
        className="list-group-item d-flex justify-content-between align-items-center publication">
        <span><i className="fa fa-file-o pub" /> {this.props.fileName} </span>
        <span>{this.props.fileSize}</span>
        <span>{this.props.fileType}</span>
        <button className="btn btn-remove" onClick={(e) => {
          e.preventDefault();
          this.props.handleRemove(this.props.index);
        }}>
          <i className="fa fa-times" />
          Remove
        </button>
      </li>
    );
  }


}

FileIndicator.propTypes = {
  id: PropTypes.string,
  // TODO: remove index once associative array implemented -> id
  index: PropTypes.number,
  fileName: PropTypes.string,
  fileSize: PropTypes.number,
  fileType: PropTypes.string,
  handleRemove: PropTypes.func,
  // TODO: whole file needed anyway for upload, could save other file related props
  // file: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  fileUploads: makeSelectFileUploads(),
  // fileUploadIndicators: makeSelectFileUploadIndicators(),
});

function mapDispatchToProps(dispatch) {
  return {
    // handleDrop: value => dispatch(addFileUpload(value)),
    handleRemove: index => dispatch(removeFileUpload(index)),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(withConnect)(FileIndicator);


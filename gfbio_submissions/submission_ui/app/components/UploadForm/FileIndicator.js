import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import {
  makeSelectFileUploads,
} from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { removeFileUpload } from '../../containers/SubmissionForm/actions';

class FileIndicator extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {};
  // }

  render() {

    console.log('FileIndicator render props');
    console.log(this.props.fileUploads);
    console.log('--------------------------------');

    const fileListElements = this.props.fileUploads.map((upload, index) => {
      console.log(upload);
      return <li
        key={index}
        className="list-group-item d-flex justify-content-between align-items-center publication">
        <small><i className="fa fa-file-o pub" /> {upload.file.name} </small>
        <small>{upload.file.size}</small>
        <small>{upload.file.type}</small>
        <b>{upload.progress}</b>
        <button className="btn btn-remove" onClick={(e) => {
          e.preventDefault();
          this.props.handleRemove(index);
        }}>
          <i className="fa fa-times" />
          Remove
        </button>
      </li>;
    });

    return (
      <ul className="list-group list-group-flush">
        {fileListElements}
      </ul>
    );
  }


}

FileIndicator.propTypes = {
  fileUploads: PropTypes.array,
  // id: PropTypes.string,
  // // TODO: remove index once associative array implemented -> id
  // index: PropTypes.number,
  // fileName: PropTypes.string,
  // fileSize: PropTypes.number,
  // fileType: PropTypes.string,
  handleRemove: PropTypes.func,
  // TODO: whole file needed anyway for upload, could save other file related props
  // file: PropTypes.object,
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


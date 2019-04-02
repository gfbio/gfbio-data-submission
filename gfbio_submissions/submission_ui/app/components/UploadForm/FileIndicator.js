import React from 'react';

import PropTypes from 'prop-types';
import { createStructuredSelector } from 'reselect';
import { makeSelectFileUploads } from '../../containers/SubmissionForm/selectors';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { removeFileUpload } from '../../containers/SubmissionForm/actions';
import filesize from 'filesize';

class FileIndicator extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {};
  // }

  render() {

    // console.log('FileIndicator render props');
    // console.log(this.props.fileUploads);
    // console.log('--------------------------------');

    const fileListElements = this.props.fileUploads.map((upload, index) => {
      console.log(upload);
      let progressStyle = {
        width: `${upload.progress}%`,
      };

      return <li
        key={index}
        className={"list-group-item file-upload "+upload.status}>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <small><i className="fa fa-file-text-o pub" /> {upload.file.name}
            </small>
          </div>
          {/*<small>{upload.file.type}</small>*/}
          {/*<b>{upload.progress}</b>*/}
          <div>
            <small
              className="mr-5 file-size">{filesize(upload.file.size)}</small>
            <button className="btn btn-download mr-3">
              <i className="icon ion-md-download"></i>
            </button>
            <button className="btn btn-remove" onClick={(e) => {
              e.preventDefault();
              this.props.handleRemove(index);
            }}>
              {/*<i className="fa fa-times" />*/}
              {/*Remove*/}
              {/*<i className="icon ion-md-trash"></i>*/}
              <i className="fa fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {/*<div className="pbar-test">*/}

        <div className="progress">
          <div className="progress-bar" role="progressbar" style={progressStyle}
               aria-valuenow={`${upload.progress}`} aria-valuemin="0"
               aria-valuemax="100"></div>
        </div>

        {/*</div>*/}
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


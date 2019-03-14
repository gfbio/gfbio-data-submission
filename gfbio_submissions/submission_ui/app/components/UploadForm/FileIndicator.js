import React from 'react';

import PropTypes from 'prop-types';

class FileIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
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
  index: PropTypes.number,
  fileName: PropTypes.string,
  fileSize: PropTypes.number,
  fileType: PropTypes.string,
  handleRemove: PropTypes.func,
  file: PropTypes.object,
};


export default FileIndicator;


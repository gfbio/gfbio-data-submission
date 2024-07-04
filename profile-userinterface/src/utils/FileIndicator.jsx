import React from "react";
import PropTypes from "prop-types";
import filesize from "filesize";
import { Button, Checkbox, List, ListItem, Container } from "@mantine/core";

const FileIndicator = ({
  fileUploads,
  handleRemove,
  metadataIndex,
  handleMetadataSelect,
}) => {
  const createScheduledUploadListElements = () => {
    return fileUploads.map((upload, index) => {
      let progressStyle = {
        width: `${upload.progress || 0}%`,
      };
      let metaDataCheckButton = (
        <small className="file-name">
          <Checkbox
            type="checkbox"
            id={`primary${index}`}
            value={index}
            onChange={() => handleMetadataSelect(index)}
            checked={index === metadataIndex}
          />
          <label htmlFor={`primary${index}`} className="metadata"></label>
          <i className="icon ion-md-document pub"></i>
          {upload.name}
        </small>
      );

      return (
        <li key={index} className={"list-group-item file-upload"}>
          <Container className="d-flex justify-content-between align-items-center">
            <Container>{metaDataCheckButton}</Container>
            <Container>
              <small className="mr-5 file-size">{filesize(upload.size)}</small>
              <span className="pr-4 mr-3"></span>
              <button
                className="btn btn-remove"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(index);
                }}
              >
                <i className="fa fa-trash" aria-hidden="true"></i>
              </button>
            </Container>
          </Container>

          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={progressStyle}
              aria-valuenow={`${upload.progress || 0}`}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </li>
      );
    });
  };

  const fileListElements = createScheduledUploadListElements();

  return (
    <ul className="list-group list-group-flush">
      {fileListElements.length > 0 && (
        <li className="list-group-item file-upload mb-3">
          <span className="upload-header">
            Metadata
            <i
              className="icon ion-ios-help-circle-outline help align-bottom"
              aria-hidden="true"
            ></i>
          </span>
        </li>
      )}
      {fileListElements}
    </ul>
  );
};

FileIndicator.propTypes = {
  fileUploads: PropTypes.array.isRequired,
  handleRemove: PropTypes.func.isRequired,
  metadataIndex: PropTypes.number.isRequired,
  handleMetadataSelect: PropTypes.func.isRequired,
};

export default FileIndicator;

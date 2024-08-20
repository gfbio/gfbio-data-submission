import React from "react";
import PropTypes from "prop-types";
import filesize from "filesize";
import { Checkbox, HoverCard } from "@mantine/core";

const FileIndicator = ({
  fileUploads,
  handleRemove,
  metadataIndex,
  handleMetadataSelect,
}) => {
  const createScheduledUploadListElements = () => {
    return fileUploads.map((upload, index) => {
      let progressStyle = {
        width: `${upload.progress || 0}%`
      };
      let metaDataCheckButton = (
        <div className="container h-100">
          <small className="file-name row h-100 pl-3">
            <div className="col-1 d-flex justify-content-end align-items-center checkbox-col">
              <Checkbox
                type="checkbox"
                id={`primary${index}`}
                value={index}
                onChange={() => handleMetadataSelect(index)}
                checked={index === metadataIndex}
              />
            </div>
            <div className="col-11 d-flex align-items-center">
              <label htmlFor={`primary${index}`} className="metadata mb-0 w-100">
                <i className="icon ion-md-document pub pr-2"></i>
                {upload.name}
              </label>
            </div>
          </small>
        </div>
      );

      return (
        <div key={index} className="row small file-list my-1 py-2">
          <div className="col-12 container">
            <div className="row">
              <div className="col-md-9">
                {metaDataCheckButton}
              </div>
              <small className="col-2 file-size d-flex align-items-center">{filesize(upload.size)}</small>
              <button
                className="col-1 btn btn-remove d-flex justify-content-end"
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(index);
                }}
              >
                <i className="fa fa-trash" aria-hidden="true"></i>
              </button>
            </div>
            <div className="row progress-row">
              <div className="col-2"></div>
              <div className="progress col-9">
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={progressStyle}
                  aria-valuenow={`${upload.progress || 0}`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const fileListElements = createScheduledUploadListElements();

  return (
    <>
      {
        fileListElements.length > 0 && (
          <div className="container mb-3">
            <div className="row">
              <div className="col-md-8">
                <div className="container">
                  <div className="row">
                    <span className="pl-0 py-3 col-6 upload-header list-header">
                      Metadata
                      <HoverCard width={320} shadow="md" position="right" withArrow>
                        <HoverCard.Target>
                          <i className="fa fa-question-circle-o pl-2" aria-hidden="true"></i>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                          <p>
                            select the primary metadata file, e.g. metadata
                            template
                          </p>
                        </HoverCard.Dropdown>
                      </HoverCard>
                    </span>
                  </div>
                </div>  
              </div>
            </div>
            {fileListElements}
          </div>
        )
      }
    </>
  );
};

FileIndicator.propTypes = {
  fileUploads: PropTypes.array.isRequired,
  handleRemove: PropTypes.func.isRequired,
  metadataIndex: PropTypes.number.isRequired,
  handleMetadataSelect: PropTypes.func.isRequired,
};

export default FileIndicator;
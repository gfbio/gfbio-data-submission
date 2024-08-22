import React from "react";
import PropTypes from "prop-types";
import filesize from "filesize";
import { Checkbox, HoverCard } from "@mantine/core";

const FileIndicator = ({
                           fileUploads,
                           fileUploadsFromServer,
                           handleRemove,
                           metadataIndex,
                           metadataSource,
                           handleMetadataSelect,
                           deleteFile,
                       }) => {
    const isFileSelected = (index, source) => {
        return metadataSource === source && metadataIndex.indices.includes(index);
    };
    const createUploadedListElements = () => {
        if (!Array.isArray(fileUploadsFromServer)) {
            return [];
        }
        return fileUploadsFromServer.map((uploaded, index) => {
            const isSelected = isFileSelected(index, "server");
            return (
                <li key={index}
                    className={`row small file-list my-1 py-2 list-group-item file-upload success ${isSelected ? "selected" : ""}`}>
                    <div className="col-12 container">
                        <div className="row">
                            <div className="col-md-9">
                                <div className="container h-100">
                                    <small className="file-name row h-100 pl-3">
                                        <div
                                            className="col-1 d-flex justify-content-end align-items-center checkbox-col">
                                            <Checkbox
                                                type="checkbox"
                                                id={`primaryUploaded${index}`}
                                                value={index}
                                                onChange={() => handleMetadataSelect(index, "server")}
                                                checked={isSelected}
                                            />
                                        </div>
                                        <div className="col-11 d-flex align-items-center">
                                            <label htmlFor={`primaryUploaded${index}`} className="metadata mb-0 w-100">
                                                <i className="icon ion-md-document pub pr-2"></i>
                                                {uploaded.file_name}
                                            </label>
                                        </div>
                                    </small>
                                </div>
                            </div>
                            <small className="col-2 file-size d-flex align-items-center">
                                {filesize(uploaded.file_size)}
                            </small>
                            <button
                                className="col-1 btn btn-remove d-flex justify-content-end"
                                onClick={(e) => {
                                    e.preventDefault();
                                    deleteFile(index, uploaded.pk);
                                }}
                            >
                                <i className="fa fa-trash" aria-hidden="true"></i>
                            </button>
                        </div>
                    </div>
                </li>
            );
        });
    };

    const createScheduledUploadListElements = () => {
        return fileUploads.map((upload, index) => {
            const isSelected = isFileSelected(index, "local");
            let progressStyle = {
                width: `${upload.progress || 0}%`,
            };

            return (
                <li key={index} className={`row small file-list my-1 py-2 ${isSelected ? "selected" : ""}`}>
                    <div className="col-12 container">
                        <div className="row">
                            <div className="col-md-9">
                                <div className="container h-100">
                                    <small className="file-name row h-100 pl-3">
                                        <div
                                            className="col-1 d-flex justify-content-end align-items-center checkbox-col">
                                            <Checkbox
                                                type="checkbox"
                                                id={`primary${index}`}
                                                value={index}
                                                onChange={() => handleMetadataSelect(index, "local")}
                                                checked={isSelected}
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
                            </div>
                            <small className="col-2 file-size d-flex align-items-center">
                                {filesize(upload.size)}
                            </small>
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

                        <div className="progress">
                            <div className="progress-bar" role="progressbar" style={progressStyle}
                                 aria-valuenow={`${upload.progress}`} aria-valuemin="0"
                                 aria-valuemax="100"></div>
                        </div>
                    </div>
                </li>
            );
        });
    };

    const uploadedFileListElement = createUploadedListElements();
    const fileListElements = createScheduledUploadListElements();

    return (
        <>
            {fileListElements.length > 0 || uploadedFileListElement.length > 0 ? (
                <div className="container mb-3">
                    <div className="row">
                        <div className="col-md-8">
                            <div className="container">
                                <div className="row">
                <span className="pl-0 py-3 col-6 upload-header list-header">
                  Metadata
              <HoverCard
                  width={320}
                  shadow="md"
                  position="right"
                  withArrow
              >
                <HoverCard.Target>
                  <i
                      className="fa fa-question-circle-o pl-2"
                      aria-hidden="true"
                  ></i>
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
                    <ul className="list-group list-group-flush">
                        {uploadedFileListElement}
                        {fileListElements}
                    </ul>
                </div>
            ) : null}
        </>
    );
};

FileIndicator.propTypes = {
    fileUploads: PropTypes.array.isRequired,
    fileUploadsFromServer: PropTypes.array.isRequired,
    handleRemove: PropTypes.func.isRequired,
    metadataIndex: PropTypes.object.isRequired,
    metadataSource: PropTypes.string.isRequired,
    handleMetadataSelect: PropTypes.func.isRequired,
    deleteFile: PropTypes.func.isRequired,
};

export default FileIndicator;

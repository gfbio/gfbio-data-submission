import { Checkbox, HoverCard } from "@mantine/core";
// import filesize from "filesize";
import PropTypes from "prop-types";
import React from "react";
import { filesize } from "filesize";

const FileIndicator = ({
                           fileUploads,
                           fileUploadsFromServer,
                           handleRemove,
                           metadataIndex,
                           metadataSource,
                           handleMetadataSelect,
                           deleteFile,
                           brokerSubmissionId,
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
                            <div className={brokerSubmissionId ? "col-md-8" : "col-md-9"}>
                                <div className="container h-100">
                                    <small className="file-name row h-100 ps-3">
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
                                                <i className="icon ion-md-document pub pe-2"></i>
                                                {uploaded.file_name}
                                            </label>
                                        </div>
                                    </small>
                                </div>
                            </div>
                            <small className="col-2 file-size d-flex align-items-center">
                                {uploaded.file_size && filesize(uploaded.file_size)}
                            </small>
                            {
                                brokerSubmissionId &&
                                <button type="button" className="col-1 btn btn-download d-flex justify-content-end">
                                    <a className="col-1 d-flex justify-content-end"
                                       href={`/api/downloads/submissions/${brokerSubmissionId}/cloudupload/download_file/${uploaded.pk}/`}
                                       target="_blank">
                                        <i className="fa fa-download"></i>
                                    </a>
                                </button>
                            }
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
                width: `${upload.percentage}%`,
            };

            const liClasses = [
                "row",
                "small",
                "file-list",
                "list-group-item",
                "my-1",
                "py-2",
                isSelected ? "selected" : "",
                upload.invalid ? "border border-danger bg-light" : "",
            ]
                .filter(Boolean)
                .join(" ");

            return (
                <li key={index} className={liClasses}>
                    <div className="col-12 container">
                        <div className="row align-items-center">
                            <div className="col-md-9">
                                <div className="container h-100">
                                    <small className="file-name row h-100 ps-3">
                                        <div className="col-auto d-flex align-items-center pe-0">
                                            {upload.invalid && (
                                                <i
                                                    className="fa fa-exclamation-circle text-danger fa-lg me-3"
                                                    title="Invalid filename"
                                                />
                                            )}
                                            <Checkbox
                                                type="checkbox"
                                                id={`primary${index}`}
                                                value={index}
                                                onChange={() => handleMetadataSelect(index, "local")}
                                                checked={isSelected}
                                            />
                                        </div>
                                        <div className="col d-flex align-items-center">
                                            <label
                                                htmlFor={`primary${index}`}
                                                className="metadata mb-0 w-100"
                                            >
                                                <i className="icon ion-md-document pub pe-2"></i>
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
                        {upload.percentage !== undefined && upload.percentage > -1 && (
                            <div className="progress">
                                <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={progressStyle}
                                    aria-valuenow={`${upload.progress}`}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                />
                            </div>
                        )}
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
                        <div className="col-12">
                            <div className="container">
                                <div className="row">
                                    <span className="ps-0 py-3 col-6 col-lg-8 upload-header list-header">
                                        Metadata
                                        <HoverCard width={320} shadow="md" position="right" withArrow>
                                        <HoverCard.Target>
                                            <i className="fa fa-question-circle-o ps-2" aria-hidden="true"></i>
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <p>
                                            Select the primary metadata file, e.g. metadata template.
                                            </p>
                                        </HoverCard.Dropdown>
                                        </HoverCard>
                                    </span>
                                    {
                                        brokerSubmissionId && (
                                            <div className="col-6 col-lg-4 btn-download-all d-flex flex-row-reverse align-items-center">
                                                <a href={`/api/downloads/submissions/${brokerSubmissionId}/cloudupload/zip/`} target="_blank">
                                                    Download All 
                                                    <i className="px-2 fa fa-file-zip-o"></i>
                                                </a>
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="scrollable-file-list">
                        <ul className="list-group list-group-flush">
                            {uploadedFileListElement}
                            {fileListElements}
                        </ul>
                    </div>
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
    brokerSubmissionId: PropTypes.string,
};

export default FileIndicator;

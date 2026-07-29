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
        return fileUploadsFromServer.sort(rankFiles).map((uploaded, index) => {
            const isSelected = isFileSelected(index, "server");
            return (
                <li key={index}
                    className={`row small file-list my-1 py-2 list-group-item file-upload success ${isSelected ? "selected" : ""} pe-0`}>
                    <div className="col-12 container">
                        <div className="row">
                            <div className={brokerSubmissionId ? "col-md-7" : "col-md-8"}>
                                <div className="container h-100">
                                    <small className="file-name row h-100 ps-3">
                                        <div
                                            className="col-1 d-flex justify-content-center align-items-center checkbox-col ps-3">
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
                            <div className="col-1 d-flex justify-content-center align-items-center">
                                {
                                    uploaded.file_status && (
                                        <HoverCard width={320} shadow="md" position="right" withArrow>
                                            <HoverCard.Target>
                                                <i className={`fa ${getIconForUpload(uploaded.file_status)} ps-0`} 
                                                    aria-hidden="true">    
                                                </i>
                                            </HoverCard.Target>
                                            <HoverCard.Dropdown>
                                                <p>
                                                    {uploaded.file_status}: 
                                                    {uploaded.file_status == "INCOMPLETE" && " Something went awry while uploading the file."}
                                                    {uploaded.file_status == "CHECKSUM MISMATCH" && " The file was uploaded to our servers, but the checksums didn't match."}
                                                    {uploaded.file_status == "UPLOADED" 
                                                        ? " The file was uploaded successfully to our servers."
                                                        : " Please try to delete the file and reupload it. Contact the curator if the problem persists."
                                                    }
                                                </p>
                                            </HoverCard.Dropdown>
                                        </HoverCard>
                                    )
                                }
                            </div>
                            <div className="col-2 d-flex justify-content-end pe-0">
                                {
                                    brokerSubmissionId &&
                                    <button type="button" className="btn btn-download  d-flex">
                                        <a className="col-1 d-flex"
                                        href={`/api/downloads/submissions/${brokerSubmissionId}/uploads/download_file/${uploaded.pk}/`}
                                        target="_blank">
                                            <i className="fa fa-download"></i>
                                        </a>
                                    </button>
                                }
                                <button
                                    className="btn btn-remove  d-flex justify-content-center"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        deleteFile(index, uploaded.pk);
                                    }}
                                >
                                    <i className="fa fa-trash" aria-hidden="true"></i>
                                </button>
                            </div>
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
                "pe-0",
                isSelected ? "selected" : "",
                upload.invalid ? "border border-danger bg-light" : "",
            ]
                .filter(Boolean)
                .join(" ");

            return (
                <li key={index} className={liClasses}>
                    <div className="col-12 container">
                        <div className="row align-items-center">
                            <div className="col-md-7">
                                <div className="container h-100">
                                    <small className="file-name row h-100 ps-3">
                                        <div className="col-1 d-flex align-items-center pe-0 checkbox-col">
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
                                        <div className="col-11 d-flex align-items-center">
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
                            <small className="col-1">
                            </small>
                            <button
                                className="col-2 btn btn-remove d-flex justify-content-end"
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
                    {
                        brokerSubmissionId && (
                            <div className="row flex-row-reverse">
                                <div className="col-6 col-lg-4 btn-download-all d-flex flex-row-reverse align-items-center">
                                    <a href={`/api/downloads/submissions/${brokerSubmissionId}/uploads/zip/`} target="_blank">
                                        Download all files
                                        <i className="px-2 fa fa-file-zip-o"></i>
                                    </a>
                                </div>
                            </div>
                        )
                    }
                    <div className="row mt-1 pe-2">
                        <div className="col-2 ps-0">
                            <span className="upload-header list-header">
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
                        </div>
                        <div className="col-5">
                        </div>
                        <div className="col-2 list-header">
                            File-Size
                        </div>
                        <div className="col-1 list-header text-center">
                            Status
                        </div>
                        <div className="col-2 list-header text-end pe-4">
                            Actions
                        </div>
                    </div>
                    <div className="row scrollable-file-list">
                        <ul className="container list-group list-group-flush pe-2">
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

function getIconForUpload(status) {
    if (status == "UPLOADED") {
        return "fa-cloud file-status-uploaded";
    }
    else if (status == "CHECKSUM MISMATCH") {
        return "fa-warning file-status-checksum-mismatch";
    }
    else if (status == "INCOMPLETE") {
        return "fa-cloud-upload file-status-incomplete";
    }
}

function rankFiles(fileA, fileB) {
    if (fileA.meta_data != fileB.meta_data) {
        return fileA.meta_data ? -1 : 1;
    }
    if (fileA.file_status != fileB.file_status) {
        var status_order_reversed = ["UPLOADED", "CHECKSUM MISMATCH", "INCOMPLETE"];
        var ret = status_order_reversed.indexOf(fileA.file_status) > status_order_reversed.indexOf(fileB.file_status) ? -1 : 1;
        return ret;
    }
    if (fileA.file_name == fileB.file_name) {
        return fileA.file_size - fileB.file_size;
    }
    return fileA.file_name > fileB.file_name ? 1 : -1;
}

export default FileIndicator;
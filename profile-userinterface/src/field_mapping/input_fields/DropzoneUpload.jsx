import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { Center, Text } from "@mantine/core";
import UploadMessage from "../../utils/UploadMessage.jsx";
import FileIndicator from "../../utils/FileIndicator.jsx";
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from "../../settings.jsx";
import getSubmissionUploads from "../../api/getSubmissionUploads";
import deleteSubmissionUpload from "../../api/deleteSubmissionUpload.jsx";
import setMetaDataFlag from "../../api/patchSubmissionUploadMetadata.jsx";

const DropzoneUpload = (props) => {
    const {
        title,
        description,
        form,
        field_id,
        onFilesChange,
        token,
    } = props;

    const [metadataIndex, setMetadataIndex] = useState({ indices: [], source: null });
    const [localFiles, setLocalFiles] = useState(form.values.files || []);
    const [filesFromServer, setFilesFromServer] = useState(form.values.serverFiles || []);

    useEffect(() => {
        const fetchServerFiles = async () => {
            try {
                const submission = JSON.parse(localStorage.getItem("submission"));
                const brokerSubmissionId = submission.broker_submission_id || "";
                const serverFileData = await getSubmissionUploads(brokerSubmissionId);
                setFilesFromServer(serverFileData);
                form.setFieldValue("serverFiles", serverFileData);
                const metadataFileIndices = serverFileData
                    .map((file, index) => file.meta_data === true ? index : null)
                    .filter(index => index !== null);
                setMetadataIndex({ indices: metadataFileIndices, source: "server" });
            } catch (error) {
                console.error("Error fetching server files:", error);
            }
        };

        fetchServerFiles();
    }, [token]);

    const handleMetadataSelect = async (index, source) => {
        const submission = JSON.parse(localStorage.getItem("submission"));
        const brokerSubmissionId = submission.broker_submission_id || "";
        if (metadataIndex.indices.includes(index) && metadataIndex.source === source) {
            const fileKey = source === "server" ? filesFromServer[index]?.pk : null;
            if (fileKey) {
                try {
                    await setMetaDataFlag(brokerSubmissionId, fileKey, false); // Set meta_data to false
                } catch (error) {
                    console.error("Error updating metadata flag on server:", error);
                }
            }
            setMetadataIndex({ indices: [], source: null });
        } else {
            if (metadataIndex.source === "server") {
                for (const idx of metadataIndex.indices) {
                    const fileKey = filesFromServer[idx]?.pk;
                    if (fileKey) {
                        try {
                            await setMetaDataFlag(brokerSubmissionId, fileKey, false); // Set meta_data to false
                        } catch (error) {
                            console.error("Error updating metadata flag on server:", error);
                        }
                    }
                }
            }
            if (source === "server") {
                const newFileKey = filesFromServer[index]?.pk;
                if (newFileKey) {
                    try {
                        await setMetaDataFlag(brokerSubmissionId, newFileKey, true); // Set meta_data to true
                    } catch (error) {
                        console.error("Error updating metadata flag on server:", error);
                    }
                }
            }
            setMetadataIndex({ indices: [index], source });
        }
        onFilesChange(localFiles, showUploadLimitMessage, index);
    };

    const matchingUploadLimit = (files) => {
        let tmpTotalSize = 0;
        for (let file of files) {
            tmpTotalSize += file.size;
        }
        return (
            tmpTotalSize <= MAX_TOTAL_UPLOAD_SIZE && files.length <= MAX_UPLOAD_ITEMS
        );
    };

    const [showUploadLimitMessage, setShowUploadLimitMessage] = useState(() => {
        return !matchingUploadLimit(localFiles);
    });

    useEffect(() => {
        setShowUploadLimitMessage(!matchingUploadLimit(localFiles));
    }, [localFiles]);

    const onDrop = (files) => {
        const updatedFiles = [...localFiles, ...files];
        setLocalFiles(updatedFiles);
        form.setFieldValue("files", updatedFiles);
        const uploadLimitExceeded = !matchingUploadLimit(updatedFiles);
        setShowUploadLimitMessage(uploadLimitExceeded);
        onFilesChange(updatedFiles, uploadLimitExceeded, metadataIndex);
    };

    const removeFile = (index) => {
        const updatedFiles = localFiles.filter((_, i) => i !== index);
        let newMetadataIndex = { indices: [], source: null };

        if (metadataIndex.source === "local") {
            const newIndices = metadataIndex.indices
                .map((i) => (i > index ? i - 1 : i))
                .filter((i) => i >= 0);
            newMetadataIndex = { indices: newIndices, source: "local" };
        }
        setLocalFiles(updatedFiles);
        setMetadataIndex(newMetadataIndex);
        form.setFieldValue("files", updatedFiles);
        const uploadLimitExceeded = !matchingUploadLimit(updatedFiles);
        setShowUploadLimitMessage(uploadLimitExceeded);
        newMetadataIndex.indices.forEach((i) => {
            onFilesChange(updatedFiles, uploadLimitExceeded, i);
        });
    };

    const onDeleteServerFile = async (index, fileKey) => {
        try {
            const submission = JSON.parse(localStorage.getItem("submission"));
            const brokerSubmissionId = submission.broker_submission_id || "";
            await deleteSubmissionUpload(brokerSubmissionId, fileKey);
            const updatedFiles = filesFromServer.filter((_, i) => i !== index);

            let newMetadataIndex = metadataIndex;
            if (metadataIndex.index === index && metadataIndex.source === "server") {
                newMetadataIndex = { index: -1, source: null };
            } else if (metadataIndex.source === "server" && metadataIndex.index > index) {
                newMetadataIndex = { index: metadataIndex.index - 1, source: "server" };
            }
            setFilesFromServer(updatedFiles);
            form.setFieldValue("files", updatedFiles);
            setMetadataIndex(newMetadataIndex);
            const uploadLimitExceeded = !matchingUploadLimit(updatedFiles);
            onFilesChange(updatedFiles, uploadLimitExceeded, newMetadataIndex.index);
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    return (
        <div className="file-upload">
            <div>
                <h2>{title}</h2>
                <Text>{description}</Text>
            </div>

            <FileIndicator
                fileUploads={localFiles}
                fileUploadsFromServer={filesFromServer}
                handleRemove={removeFile}
                deleteFile={onDeleteServerFile}
                metadataIndex={metadataIndex}
                metadataSource={metadataIndex.source}
                handleMetadataSelect={handleMetadataSelect}
            />

            <UploadMessage showUploadLimitMessage={showUploadLimitMessage} />

            <Dropzone h={120} p={0} multiple onDrop={onDrop}>
                <Center h={120}>
                    <Dropzone.Idle>
                        Try <b>dropping</b> some files here, or <b>click</b> to select files
                        to upload.
                    </Dropzone.Idle>
                    <Dropzone.Accept>Drop files here...</Dropzone.Accept>
                    <Dropzone.Reject>Files are invalid</Dropzone.Reject>
                </Center>
            </Dropzone>

            {form.errors.files && (
                <Text c="red" mt={5}>
                    {form.errors.files}
                </Text>
            )}
        </div>
    );
};

DropzoneUpload.defaultProps = {
    serverFiles: [],
};

DropzoneUpload.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    onFilesChange: PropTypes.func.isRequired,
    token: PropTypes.string.isRequired,
    brokerSubmissionId: PropTypes.string.isRequired,
    serverFiles: PropTypes.array,
    onDeleteServerFile: PropTypes.func.isRequired,
    onMetadataSelectServerFile: PropTypes.func.isRequired,
};

export default DropzoneUpload;

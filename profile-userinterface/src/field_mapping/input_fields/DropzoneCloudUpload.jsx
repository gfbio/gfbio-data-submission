import { Center, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from "../../settings.jsx";
import FileIndicator from "../../utils/FileIndicator.jsx";
import UploadMessage from "../../utils/UploadMessage.jsx";
import patchSubmissionCloudUpload from "../../api/patchSubmissionCloudUploadMetadata.jsx";
import deleteSubmissionCloudUpload from "../../api/deleteSubmissionCloudUpload.jsx";
import InvalidFilenameMessage from "../../utils/InvalidFileNameMessage.jsx";

const DropzoneUpload = ({ title, description, form, onFilesChange, submissionData }) => {
    const [localFiles, setLocalFiles] = useState([]);
    const [serverFiles, setServerFiles] = useState(form.values.files || []);
    const [metadataIndex, setMetadataIndex] = useState({ indices: [], source: null });
    const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);
    const [showInvalidFilenameMessage, setShowInvalidFilenameMessage] = useState(false);
    const allowedCharacters = "Letters (A-Z, a-z), Numbers (0-9), and special characters: ! . _ ' ( ) -";
    const allowedRegex = /^[a-zA-Z0-9!._*'()\- ]+$/;

    useEffect(() => {
        // Find metadata files
        if (metadataIndex.source === null) {
            const metadataIndices = serverFiles
                .map((file, index) => (file.meta_data ? index : -1))
                .filter(index => index !== -1);
            setMetadataIndex({ indices: metadataIndices, source: "server" });
        }
    }, [serverFiles, metadataIndex.source]);

    const checkUploadLimits = (localFiles, serverFiles) => {
        const totalCount = localFiles.length + serverFiles.length;
        const totalSize =
            localFiles.reduce((sum, file) => sum + (file.size || 0), 0) +
            serverFiles.reduce((sum, file) => sum + (file.file_size || 0), 0);
        return totalSize <= MAX_TOTAL_UPLOAD_SIZE && totalCount <= MAX_UPLOAD_ITEMS;
    };

    const handleDrop = (droppedFiles) => {
        const processedFiles = droppedFiles.map((file) => {
            const sanitizedName = file.name.replace(/ +/g, "_");
            file.sanitizedName = sanitizedName;
            file.invalid = !allowedRegex.test(sanitizedName);
            return file;
        });
        const newFiles = [...localFiles, ...processedFiles];
        const withinLimits = checkUploadLimits(newFiles, serverFiles);

        setLocalFiles(newFiles);
        setUploadLimitExceeded(!withinLimits);

        const anyInvalid = newFiles.some(file => file.invalid);
        setShowInvalidFilenameMessage(anyInvalid);

        onFilesChange(newFiles, !withinLimits, metadataIndex);
        form.setFieldValue("files", [...serverFiles, ...newFiles]);
    };

    const handleRemoveLocal = (index) => {
        const newFiles = localFiles.filter((_, i) => i !== index);
        const withinLimits = checkUploadLimits(newFiles, serverFiles);

        const anyInvalid = newFiles.some((file) => file.invalid);
        setShowInvalidFilenameMessage(anyInvalid);

        const newMetadata = metadataIndex.source === "local"
            ? updateMetadataIndexAfterRemoval(metadataIndex, index, "local")
            : metadataIndex;

        setMetadataIndex(newMetadata);
        setLocalFiles(newFiles);
        setUploadLimitExceeded(!withinLimits);
        onFilesChange(newFiles, !withinLimits, newMetadata);
        form.setFieldValue("files", [...serverFiles, ...newFiles]);
    };

    const handleRemoveServer = async (index) => {
        if (!submissionData?.broker_submission_id) return;

        const brokerSubmissionId = submissionData?.broker_submission_id;

        try {
            const fileToDelete = serverFiles[index];
            await deleteSubmissionCloudUpload(brokerSubmissionId, fileToDelete.pk);

            const newServerFiles = serverFiles.filter((_, i) => i !== index);
            setServerFiles(newServerFiles);

            const newMetadata = metadataIndex.source === "server"
                ? updateMetadataIndexAfterRemoval(metadataIndex, index, "server")
                : metadataIndex;
            setMetadataIndex(newMetadata);
        } catch (error) {
            console.error("Error deleting server file:", error);
        }
    };

    const updateServerMetadata = async (file, isMetadata) => {
        if (!submissionData?.broker_submission_id) return;

        const brokerSubmissionId = submissionData?.broker_submission_id;

        try {
            const formData = new FormData();
            formData.append("meta_data", isMetadata);
            await patchSubmissionCloudUpload(brokerSubmissionId, file.pk, formData);
        } catch (error) {
            console.error("Error updating metadata flag:", error);
        }
    };

    const deselectServerFile = async (index) => {
        if (!submissionData?.broker_submission_id || !serverFiles[index]) return;
        await updateServerMetadata(serverFiles[index], false);
    };

    const handleMetadataToggle = async (index, source) => {
        if (source === "local") {
            // Deselect previously selected server file if exists
            if (metadataIndex.source === "server" && metadataIndex.indices.length > 0) {
                await deselectServerFile(metadataIndex.indices[0]);
            }

            if (localFiles[index].meta_data) {
                // Deselect current file if it's selected
                localFiles[index].meta_data = false;
                setMetadataIndex({ indices: [], source: null });
                onFilesChange(localFiles, uploadLimitExceeded, { indices: [], source: null });
            } else {
                // Ensure only one local file is marked as metadata:
                localFiles.forEach((file, i) => {
                    file.meta_data = (i === index);
                });
                const newMetaIndex = { indices: [index], source: "local" };
                setMetadataIndex(newMetaIndex);
                onFilesChange(localFiles, uploadLimitExceeded, newMetaIndex);
            }
            setLocalFiles([...localFiles]);
        } else if (source === "server") {
            // For server files, check if it's already selected.
            const isCurrentlySelected =
                metadataIndex.source === "server" && metadataIndex.indices.includes(index);

            // Deselect current file if it's selected
            if (isCurrentlySelected) {
                await deselectServerFile(index);
                setMetadataIndex({ indices: [], source: null });
                onFilesChange(localFiles, uploadLimitExceeded, { indices: [], source: null });
                return;
            }

            // Deselect previously selected server file if exists
            if (metadataIndex.source === "server" && metadataIndex.indices.length > 0) {
                await deselectServerFile(metadataIndex.indices[0]);
            }

            await updateServerMetadata(serverFiles[index], true);
            const newMetaIndex = { indices: [index], source: "server" };
            setMetadataIndex(newMetaIndex);
            onFilesChange(localFiles, uploadLimitExceeded, newMetaIndex);
        }
    };

    const updateMetadataIndexAfterRemoval = (currentMeta, removedIndex, sourceType) => {
        if (currentMeta.source !== sourceType) return currentMeta;
        if (!currentMeta.indices || currentMeta.indices.length === 0) return currentMeta;

        // If the removed file is the one selected for metadata, clear the selection.
        if (currentMeta.indices.includes(removedIndex)) {
            return { indices: [], source: sourceType };
        }

        // Otherwise, adjust any indices that come after the removed file.
        const newIndices = currentMeta.indices.map(i => (i > removedIndex ? i - 1 : i));
        return { indices: newIndices, source: sourceType };
    };

    return (
        <div className="file-upload">
            <div>
                <h2>{title}</h2>
                <Text>{description}</Text>
            </div>

            <InvalidFilenameMessage
                showInvalidFilenameMessage={showInvalidFilenameMessage}
                allowedCharacters={allowedCharacters}
            />

            <FileIndicator
                fileUploads={localFiles}
                fileUploadsFromServer={serverFiles}
                handleRemove={handleRemoveLocal}
                deleteFile={handleRemoveServer}
                metadataSource={metadataIndex.source}
                metadataIndex={metadataIndex}
                handleMetadataSelect={handleMetadataToggle}
            />

            <UploadMessage showUploadLimitMessage={uploadLimitExceeded} />

            <Dropzone h={120} p={0} multiple onDrop={handleDrop}>
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

DropzoneUpload.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    onFilesChange: PropTypes.func.isRequired,
    submissionData: PropTypes.object.isRequired,
};

export default DropzoneUpload;

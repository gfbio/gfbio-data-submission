import { Center, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from "../../settings.jsx";
import FileIndicator from "../../utils/FileIndicator.jsx";
import UploadMessage from "../../utils/UploadMessage.jsx";
import patchSubmissionCloudUpload from "../../api/patchSubmissionCloudUploadMetadata.jsx";
import deleteSubmissionCloudUpload from "../../api/deleteSubmissionCloudUpload.jsx";

const DropzoneUpload = ({ title, description, form, onFilesChange, submissionData }) => {
    const [localFiles, setLocalFiles] = useState([]);
    const [serverFiles, setServerFiles] = useState(form.values.files || []);
    const [metadataIndex, setMetadataIndex] = useState({ indices: [], source: null });
    const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);

    useEffect(() => {
        // Find metadata files
        const metadataIndices = serverFiles
            .map((file, index) => file.meta_data ? index : -1)
            .filter(index => index !== -1);
        setMetadataIndex({ indices: metadataIndices, source: "server" });
    }, [serverFiles]);

    const checkUploadLimits = (files) => {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        return totalSize <= MAX_TOTAL_UPLOAD_SIZE && files.length <= MAX_UPLOAD_ITEMS;
    };

    const handleDrop = (droppedFiles) => {
        const newFiles = [...localFiles, ...droppedFiles];
        const withinLimits = checkUploadLimits(newFiles);

        setLocalFiles(newFiles);
        setUploadLimitExceeded(!withinLimits);
        onFilesChange(newFiles, !withinLimits, metadataIndex);
        form.setFieldValue("files", [...serverFiles, ...newFiles]);
    };

    const handleRemoveLocal = (index) => {
        const newFiles = localFiles.filter((_, i) => i !== index);
        const withinLimits = checkUploadLimits(newFiles);

        // Update metadata indices
        if (metadataIndex.source === "local") {
            const newIndices = metadataIndex.indices
                .map(i => i > index ? i - 1 : i)
                .filter(i => i !== -1);
            setMetadataIndex({ indices: newIndices, source: "local" });
        }

        setLocalFiles(newFiles);
        setUploadLimitExceeded(!withinLimits);
        onFilesChange(newFiles, !withinLimits, metadataIndex);
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

            // Update metadata indices
            if (metadataIndex.source === "server") {
                const newIndices = metadataIndex.indices
                    .map(i => i > index ? i - 1 : i)
                    .filter(i => i !== -1);
                setMetadataIndex({ indices: newIndices, source: "server" });
            }
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
        const isCurrentlySelected = metadataIndex.indices.includes(index) && metadataIndex.source === source;
        const isServerSource = source === "server";

        // Deselect current file if it's selected
        if (isCurrentlySelected) {
            if (isServerSource) {
                await deselectServerFile(index);
            }
            setMetadataIndex({ indices: [], source: null });
            return;
        }

        // Deselect previously selected server file if exists
        if (metadataIndex.source === "server") {
            await deselectServerFile(metadataIndex.indices[0]);
        }

        // Select new file
        if (isServerSource) {
            await updateServerMetadata(serverFiles[index], true);
        }

        setMetadataIndex({ indices: [index], source });
    };

    return (
        <div className="file-upload">
            <div>
                <h2>{title}</h2>
                <Text>{description}</Text>
            </div>

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

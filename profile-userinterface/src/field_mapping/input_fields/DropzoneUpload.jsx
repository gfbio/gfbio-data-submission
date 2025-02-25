import { Center, Text } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import deleteSubmissionUpload from "../../api/deleteSubmissionUpload.jsx";
import getSubmissionUploads from "../../api/getSubmissionUploads";
import patchSubmissionUpload from "../../api/patchSubmissionUploadMetadata.jsx";
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from "../../settings.jsx";
import FileIndicator from "../../utils/FileIndicator.jsx";
import UploadMessage from "../../utils/UploadMessage.jsx";

const DropzoneUpload = ({ title, description, form, field_id, onFilesChange, brokerSubmissionId }) => {
    const [localFiles, setLocalFiles] = useState([]);
    const [serverFiles, setServerFiles] = useState([]);
    const [metadataIndex, setMetadataIndex] = useState({ indices: [], source: null });
    const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);

    // Fetch server files on component mount
    useEffect(() => {
        const fetchServerFiles = async () => {
            if (!brokerSubmissionId) return;
            
            try {
                const serverFileData = await getSubmissionUploads(brokerSubmissionId);
                setServerFiles(serverFileData);
                // Find metadata files
                const metadataIndices = serverFileData
                    .map((file, index) => file.meta_data ? index : -1)
                    .filter(index => index !== -1);
                setMetadataIndex({ indices: metadataIndices, source: "server" });
            } catch (error) {
                console.error("Error fetching server files:", error);
            }
        };

        fetchServerFiles();
    }, [brokerSubmissionId]);

    const checkUploadLimits = (files) => {
        const totalSize = files.reduce((sum, file) => sum + file.size, 0);
        return totalSize <= MAX_TOTAL_UPLOAD_SIZE && files.length <= MAX_UPLOAD_ITEMS;
    };

    const handleDrop = (droppedFiles) => {
        const newFiles = [...localFiles, ...droppedFiles];
        const withinLimits = checkUploadLimits(newFiles);
        
        setLocalFiles(newFiles);
        form.setFieldValue(field_id, newFiles);
        setUploadLimitExceeded(!withinLimits);
        onFilesChange(newFiles, !withinLimits, metadataIndex);
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
        form.setFieldValue(field_id, newFiles);
        setUploadLimitExceeded(!withinLimits);
        onFilesChange(newFiles, !withinLimits, metadataIndex);
    };

    const handleRemoveServer = async (index) => {
        if (!brokerSubmissionId) return;

        try {
            const fileToDelete = serverFiles[index];
            await deleteSubmissionUpload(brokerSubmissionId, fileToDelete.pk);
            
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

    const handleMetadataToggle = async (index, source) => {
        if (source === "server" && brokerSubmissionId) {
            try {
                const file = serverFiles[index];
                const formData = new FormData();
                const isCurrentlyMetadata = metadataIndex.indices.includes(index);
                formData.append("meta_data", !isCurrentlyMetadata);

                await patchSubmissionUpload(brokerSubmissionId, file.pk, formData);
                
                const newIndices = isCurrentlyMetadata
                    ? metadataIndex.indices.filter(i => i !== index)
                    : [...metadataIndex.indices, index];
                setMetadataIndex({ indices: newIndices, source: "server" });
            } catch (error) {
                console.error("Error updating metadata flag:", error);
            }
        } else {
            const isCurrentlyMetadata = metadataIndex.indices.includes(index);
            const newIndices = isCurrentlyMetadata
                ? metadataIndex.indices.filter(i => i !== index)
                : [...metadataIndex.indices, index];
            setMetadataIndex({ indices: newIndices, source: "local" });
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
                fileUploadsFromServer={serverFiles}
                handleRemove={handleRemoveLocal}
                deleteFile={handleRemoveServer}
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
    field_id: PropTypes.string.isRequired,
    onFilesChange: PropTypes.func.isRequired,
    brokerSubmissionId: PropTypes.string,
};

DropzoneUpload.defaultProps = {
    brokerSubmissionId: '',
};

export default DropzoneUpload;

import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { Dropzone } from "@mantine/dropzone";
import { Center, Text } from "@mantine/core";
import UploadMessage from "./UploadMessage";
import FileIndicator from "./FileIndicator";
import { MAX_TOTAL_UPLOAD_SIZE, MAX_UPLOAD_ITEMS } from "../../settings.jsx";

const DropzoneUpload = (props) => {
  const { title, description, form, field_id, onFilesChange } = props;
  const [metadataIndex, setMetadataIndex] = useState(-1);
  const [localFiles, setLocalFiles] = useState(form.values.files || []);
  const handleMetadataSelect = (index) => {
    const newMetadataIndex = metadataIndex === index ? -1 : index;
    setMetadataIndex(newMetadataIndex);
    onFilesChange(localFiles, showUploadLimitMessage, newMetadataIndex);
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
    console.log("metadataindex:" + metadataIndex);
    console.log("index:" + index);

    const updatedFiles = localFiles.filter((_, i) => i !== index);

    let newMetadataIndex = metadataIndex;

    if (metadataIndex === index) {
      newMetadataIndex = -1; // Reset metadata index if the metadata file is removed
    } else if (metadataIndex > index) {
      newMetadataIndex = metadataIndex - 1; // Adjust metadata index if necessary
    }
    setLocalFiles(updatedFiles);
    setMetadataIndex(newMetadataIndex);
    form.setFieldValue("files", updatedFiles);
    console.log("aaafter delete: " + newMetadataIndex);
    const uploadLimitExceeded = !matchingUploadLimit(updatedFiles);
    setShowUploadLimitMessage(uploadLimitExceeded);
    onFilesChange(updatedFiles, uploadLimitExceeded, newMetadataIndex);
  };

  return (
    <div>
      <header className="header header-left form-header-top">
        <h2 className="section-title">{title}</h2>
        <p className="section-subtitle">{description}</p>
      </header>
      <UploadMessage showUploadLimitMessage={showUploadLimitMessage} />

      <Dropzone h={120} p={0} multiple onDrop={onDrop}>
        <Center h={120}>
          <Dropzone.Idle>
            Try dropping some files here, or click to select files to upload.
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

      <FileIndicator
        fileUploads={localFiles}
        handleRemove={removeFile}
        metadataIndex={metadataIndex}
        handleMetadataSelect={handleMetadataSelect}
      />
    </div>
  );
};

DropzoneUpload.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
  onFilesChange: PropTypes.func.isRequired,
};

export default DropzoneUpload;

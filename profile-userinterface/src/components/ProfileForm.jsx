import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import FormField from "../field_mapping/FormField.jsx";
import postSubmission from "../api/postSubmission.jsx";
import createUploadFileChannel from "../api/createUploadFileChannel.jsx";

const ProfileForm = (props) => {
  const {profileData, submissionData, isLoading, profileError, SubmissionError} = props;
  const [isProcessing, setProcessing] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);
  const [metadataIndex, setMetadataIndex] = useState(-1);
  const form = useForm({
    mode: "uncontrolled",
    name: "profile-form",
    validateInputOnBlur: true,
    initialValues: {
      files: [],
    },
    // onValuesChange: (values) => {
    //     window.localStorage.setItem('profile-form', JSON.stringify(values));
    // },
    // TODO: validation based on field_name -> where to dynamically address this ?
    //      -> process and display validation from server ? this way the ui would be in sync without the need of
    //          further implementation on this, since validation is part of the JsonSchema in the backend.
    // validate: {
    //     generic_title_1: (value) =>
    //         value.length < 2 ? 'Title is too short' : null,
    // },
    validate: (values) => {
      let field_types = profileData.fields.map(
        (field) => field.field_type.type
      );
      if (field_types.includes("data-url-field")) {
        return validateDataUrlField(values, profileData);
      }
    },
  });

  const handleFilesChange = (uploadedFiles, isValid, metaIndex) => {
    form.setFieldValue("files", uploadedFiles);
    setFiles(uploadedFiles);
    setUploadLimitExceeded(isValid);
    setMetadataIndex(metaIndex);
  };

  const handleFileUpload = async (file, brokerSubmissionId, isMetadata) => {
    const attach_to_ticket = false;
    const meta_data = isMetadata;
    let token = "";
    if (window.props !== undefined) {
      token = window.props.token || "no-token-found";
    }
    try {
      await createUploadFileChannel(
        brokerSubmissionId,
        file,
        attach_to_ticket,
        meta_data,
        token,
        (percentCompleted) => {
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      );
      console.log("Upload complete");
    } catch (error) {
      console.error("Upload error: ", error);
    }
  };

  const handleSubmit = async (values) => {
    if (!form.isValid || uploadLimitExceeded) {
      return;
    }
    setProcessing(true);
    // TODO: fixed token value for local testing only
    try {
      const result = await postSubmission(
        profileData.target,
        localStorage.getItem("embargo"),
        values,
      );
      if (result && result.broker_submission_id) {
        const brokerSubmissionId = result.broker_submission_id;
        for (let i = 0; i < files.length; i++) {
          await handleFileUpload(
            files[i],
            brokerSubmissionId,
            i === metadataIndex,
          );
        }
      } else {
        console.error("broker_submission_id is missing in the response data.");
      }
    } catch (error) {
      console.error("Submission error: ", error);
    } finally {
      setProcessing(false);
    }
    // setProcessing(false);
  };
  console.log('FORM FIELDS ', profileData.form_fields);
  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <p>processing: {"" + isProcessing}</p>
      {profileData.fields.map((field, index) => (
        <FormField
          key={index}
          field={field}
          form={form}
          onFilesChange={handleFilesChange}
        />
      ))}
      <Group justify="flex-end" mt="md">
        <Button type="submit">Submit</Button>
      </Group>
    </form>
  );
};

ProfileForm.propTypes = {
  profileData: PropTypes.object.isRequired,
};

export default ProfileForm;

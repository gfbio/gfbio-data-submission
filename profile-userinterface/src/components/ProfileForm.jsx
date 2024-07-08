import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import FormField from "../field_mapping/FormField.jsx";
import postSubmission from "../api/postSubmission.jsx";
import createUploadFileChannel from "../api/createUploadFileChannel.jsx";
import validateDataUrlField from "../utils/DataUrlValidation.jsx";

const ProfileForm = (props) => {
  const {
    profileData,
    submissionData,
    isLoading,
    profileError,
    SubmissionError,
  } = props;
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
      let field_types = profileData.form_fields.map(
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

  const handleSubmit = (values) => {
    if (!form.isValid || uploadLimitExceeded) {
      return;
    }
    setProcessing(true);
    // TODO: fixed token value for local testing only

    postSubmission(profileData.target, localStorage.getItem("embargo"), values)
      .then((result) => {
        if (result && result.broker_submission_id) {
          const brokerSubmissionId = result.broker_submission_id;
          const fileUploadPromises = files.map((file, index) =>
            handleFileUpload(file, brokerSubmissionId, index === metadataIndex),
          );
          return Promise.all(fileUploadPromises);
        } else {
          console.error(
            "broker_submission_id is missing in the response data.",
          );
          // Throw an error to trigger the catch block
          throw new Error(
            "broker_submission_id is missing in the response data.",
          );
        }
      })
      .catch((error) => {
        console.error("Submission error: ", error);
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  console.log("FORM FIELDS ", profileData.form_fields);
  return (
    <form
      onSubmit={form.onSubmit(handleSubmit)}
      className="submission-form container"
    >
      <p>processing: {"" + isProcessing}</p>
      <div className="row">
        <div className="col-md-9 main-col">
          {profileData.form_fields
            .filter((field) => field.position == "main")
            .map((field, index) => (
              <FormField
                key={index}
                field={field}
                form={form}
                onFilesChange={handleFilesChange}
              ></FormField>
            ))}
        </div>
        <div className="col-md-3 side-col">
          {profileData.form_fields
            .filter((field) => field.position == "sidebar")
            .map((field, index) => (
              <FormField
                key={index}
                field={field}
                form={form}
                onFilesChange={handleFilesChange}
              ></FormField>
            ))}
        </div>
      </div>
      <div className="row">
        <Group mt="md" className="mt-5 col-md-9">
          <Button className="submission-button" type="submit">
            <i className="fa fa-play mr-3"></i> Create Submission
          </Button>
        </Group>
      </div>
    </form>
  );
};

ProfileForm.propTypes = {
  profileData: PropTypes.object.isRequired,
};

export default ProfileForm;

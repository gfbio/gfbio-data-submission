import React, {useState} from 'react';
import PropTypes from "prop-types";
import {Button, Group} from '@mantine/core';
import {useForm} from '@mantine/form';
import FormField from "../field_mapping/FormField.jsx";
import postSubmission from "../api/postSubmission.jsx";


const ProfileForm = (props) => {
    const {profileData, submissionData, isLoading, profileError, SubmissionError} = props;
    const [isProcessing, setProcessing] = useState(false);

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

    const handleSubmit = (values) => {
        setProcessing(true);
        // TODO: fixed token value for local testing only
        postSubmission(
            profileData.target,
            localStorage.getItem('embargo'),
            values)
            .then((result) => {
                console.log('DATA ', result);
            })
            .finally(() => {
                setProcessing(false);
            });
        // setProcessing(false);
    };
    console.log('FORM FIELDS ', profileData.form_fields);
    return (
        <form onSubmit={form.onSubmit(handleSubmit)} className='submission-form'>
            <p>processing: {"" + isProcessing}</p>
            {profileData.form_fields.map((field, index) => (
                <FormField key={index} field={field} form={form}></FormField>
            ))}
            <Group mt="md" className='mt-5'>
                <Button className='submission-button' type="submit"><i class="fa fa-play mr-3"></i> Create Submission</Button>
            </Group>
        </form>
    );
};

ProfileForm.propTypes = {
  profileData: PropTypes.object.isRequired,
};

export default ProfileForm;

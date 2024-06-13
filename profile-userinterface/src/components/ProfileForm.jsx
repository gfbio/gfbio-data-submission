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
        mode: 'uncontrolled',
        name: 'profile-form',
        initialValues: {
            files: []
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

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <p>processing: {"" + isProcessing}</p>
            {profileData.fields.map((field, index) => (
                <FormField key={index} field={field} form={form}></FormField>
            ))}
            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
};

ProfileForm.propTypes = {
    profileData: PropTypes.object.isRequired
}

export default ProfileForm;

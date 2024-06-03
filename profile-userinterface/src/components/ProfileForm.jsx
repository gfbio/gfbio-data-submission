import React, {useState} from 'react';
import PropTypes from "prop-types";
import {Button, Group} from '@mantine/core';
import {useForm} from '@mantine/form';
import FormField from "../field_mapping/FormField.jsx";
import postSubmission from "../api/postSubmission.jsx";


const ProfileForm = ({data}) => {

    const [isProcessing, setProcessing] = useState(false);

    // console.log('ProfileForm');
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
        // validate: {
        //     generic_title_1: (value) =>
        //         value.length < 2 ? 'Title is too short' : null,
        // },
    });

    const handleSubmit = (values) => {
        setProcessing(true);
        console.log(values);
        postSubmission('66b66251e245103c249141d00df43d163cdebb80', data.target, values)
            .then((result) => {
                console.log('DATA ', result);
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    // form.setInitialValues({email: 'bla@bla.com',})
    // <form
    //     onSubmit={form.onSubmit(
    //         (values, event) => {
    //             console.log(
    //                 values, // <- form.getValues() at the moment of submit
    //                 event // <- form element submit event
    //             );
    //         },
    //         (validationErrors, values, event) => {
    //             console.log(
    //                 validationErrors, // <- form.errors at the moment of submit
    //                 values, // <- form.getValues() at the moment of submit
    //                 event // <- form element submit event
    //             );
    //         }
    //     )}
    // >

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <h2>processing: {"" + isProcessing}</h2>
            <h3>Name: {data.name}</h3>
            <h3>Target: {data.target}</h3>
            {data.fields.map((field, index) => (
                <FormField key={index} field={field} form={form}></FormField>
            ))}
            <Group justify="flex-end" mt="md">
                <Button type="submit">Submit</Button>
            </Group>
        </form>
    );
};

ProfileForm.propTypes = {
    data: PropTypes.object.isRequired
}

export default ProfileForm;

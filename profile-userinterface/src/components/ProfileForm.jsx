import React from 'react';
import PropTypes from "prop-types";
import {Button, Group} from '@mantine/core';
import {useForm} from '@mantine/form';
import FormField from "../field_mapping/FormField.jsx";

const ProfileForm = ({data}) => {

    const form = useForm({
        mode: 'uncontrolled',
        name: 'profile-form',
        initialValues: {
            // email: '',
            // termsOfService: false,
        },
        // onValuesChange: (values) => {
        //     window.localStorage.setItem('profile-form', JSON.stringify(values));
        // },
        // validate: {
        //     email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        // },
    });

    form.setInitialValues({email: 'bla@bla.com',})

    return (
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
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

import React from 'react';
import {TextInput} from '@mantine/core';
import PropTypes from "prop-types";
// const TextField = (title, descr, initialValue) => {
const TextField = (props) => {
    const {title, description, form, field_id, placeholder} = props;
    // console.log('TextField props: ', props);
    // console.log('TextField title: ', title);

    return (
        <TextInput
            label={title}
            description={description}
            placeholder={placeholder}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
        />
    );
}

TextField.defaultProps = {
    placeholder: "",
}

TextField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
}

export default TextField;

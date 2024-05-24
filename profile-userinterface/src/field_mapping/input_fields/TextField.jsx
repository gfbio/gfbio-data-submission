import React from 'react';
import {TextInput} from '@mantine/core';
import PropTypes from "prop-types";
// const TextField = (title, descr, initialValue) => {
const TextField = (props) => {
    const {title, description, placeholder} = props;
    return (
        <TextInput
            label={title}
            description={description}
            placeholder={placeholder}
        />
    );
}

TextField.defaultProps = {
    placeholder: "PLACEH...",
}

TextField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
}

export default TextField;

import React from 'react';
import { Textarea } from '@mantine/core';
import PropTypes from "prop-types";
// const TextField = (title, descr, initialValue) => {
const TextField = (props) => {
    const {title, description, placeholder} = props;
    return (
        <Textarea
            label={title}
            description={description}
            placeholder={placeholder}
            autosize
            minRows={2}
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

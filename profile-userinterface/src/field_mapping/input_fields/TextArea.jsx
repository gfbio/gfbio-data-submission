import React from 'react';
import {Textarea} from '@mantine/core';
import PropTypes from "prop-types";

const TextArea = (props) => {
    const {title, description, form, field_id, placeholder} = props;
    return (
        <Textarea
            label={title}
            description={description}
            placeholder={placeholder}
            autosize
            minRows={2}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
        />
    );
}

TextArea.defaultProps = {
    placeholder: "",
}

TextArea.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
}

export default TextArea;

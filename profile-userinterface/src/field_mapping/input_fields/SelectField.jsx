import React, {useEffect, useState} from 'react';
import {Select} from '@mantine/core';
import PropTypes from "prop-types";

const SelectField = (props) => {
    const {title, description, form, options, field_id} = props;

    // TODO: add parameter to be able to switch between this and empty values if select is
    //  initally empty (or has placeholder)

    // setting inital values, so that there is always a value for the field in the form
    //  even if nothing is actively selected (e.g. GFBio-Datacenter...).
    const [value, setValue] = useState(options.at(0));

    useEffect(() => {
        form.setFieldValue(field_id, value);
    }, []);

    //TODO: this could be used for any field that deals with options
    const handleChange = (option) => {
        setValue(option.value);
        form.setFieldValue(field_id, option.value);
    }

    return (
        <Select
            label={title}
            description={description}
            // placeholder={default}
            data={options}
            defaultValue={options.at(0)}
            onChange={(_value, option) => handleChange(option)}
            searchable
        />
    );
}

SelectField.defaultProps = {
    // default: "",
}

SelectField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    // default: PropTypes.string,
    options: PropTypes.array,
}

export default SelectField;

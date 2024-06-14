import {React, useEffect} from 'react';
import {MultiSelect} from '@mantine/core';
import PropTypes from "prop-types";

const MultiSelectDropdown = (props) => {
    const {title, description, form, options, field_id, default_value} = props;
    const initial_value = default_value ? default_value.split(",") : []
    useEffect(() => {
        form.setFieldValue(field_id, initial_value);
    }, []);

    const handleChange = (val) => {
        form.setFieldValue(field_id, val);
    }
    const data = options.map(opt => { return {label: opt.option, value: opt.option};});

    return (
        <div>
            <MultiSelect
                defaultValue={initial_value}
                data={data}
                label={title}
                description={description}
                placeholder="Select all matching"
                onChange={(value) => { handleChange(value); }}
            />
        </div>
    );
}

MultiSelectDropdown.defaultProps = {
    default_value: ""
}

MultiSelectDropdown.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    default_value: PropTypes.string,
}

export default MultiSelectDropdown;

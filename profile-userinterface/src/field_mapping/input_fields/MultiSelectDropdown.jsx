import {React, useState} from 'react';
import {MultiSelect} from '@mantine/core';
import PropTypes from "prop-types";

const MultiSelectDropdown = (props) => {
    const {title, description, form, options, field_id, default_value} = props;
    // TODO: setting the default-value this way leads to infinite reloads, especially when multiple elements do it that way
    // const initial_value = default_value ? default_value.split(",") : []
    //const [value, setValue] = useState(initial_value);
    //form.setFieldValue(field_id, value);
    const mapped_options = options.map(opt => opt.option);
    console.log(field_id);

    const handleChange = (val) => {
        //setValue(val);
        form.setFieldValue(field_id, val);
    }
    const data = mapped_options.map(opt => { return {label: opt, value: opt};});

    return (
        <div>
            <MultiSelect
                /*defaultValue={initial_value}*/
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

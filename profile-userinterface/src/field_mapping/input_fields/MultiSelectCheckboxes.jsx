import {React, useEffect} from 'react';
import {Checkbox} from '@mantine/core';
import PropTypes from "prop-types";

const MultiSelectCheckboxes = (props) => {
    const {title, description, form, options, field_id, default_value} = props;
    useEffect(() => {
        const initial_value = default_value ? default_value.split(",") : []
        form.setFieldValue(field_id, initial_value);
    }, []);
    const mapped_options = options.map(opt => opt.option);

    return (
        <div>
            <Checkbox.Group
                label={title}
                description={description}
                key={form.key(field_id)}
                {...form.getInputProps(field_id)}
            >
                {mapped_options.map(function(opt){
                    return (
                        <Checkbox 
                            value={opt}
                            label={opt}
                        />
                    )
                })}
            </Checkbox.Group>
        </div>
    );
}

MultiSelectCheckboxes.defaultProps = {
    default_value: ""
}

MultiSelectCheckboxes.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    default_value: PropTypes.string,
}

export default MultiSelectCheckboxes;

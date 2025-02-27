import { MultiSelect } from '@mantine/core';
import PropTypes from "prop-types";

const MultiSelectDropdown = ({ title, description, form, options, field_id }) => {
    const data = options.map(opt => ({ 
        label: opt.option, 
        value: opt.option 
    }));

    return (
        <MultiSelect
            data={data}
            label={title}
            description={description}
            placeholder="Select all matching"
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
        />
    );
};

MultiSelectDropdown.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired
    })).isRequired,
};

export default MultiSelectDropdown;

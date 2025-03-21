import { Select } from "@mantine/core";
import PropTypes from "prop-types";

const SelectField = ({ title, description, mandatory, form, options, field_id, placeholder, default_value }) => {
    const data = options.map(opt => ({
        label: opt.option,
        value: opt.option
    }));

    const inputProps = form.getInputProps(field_id)
    if (!inputProps.defaultValue && default_value) {
        inputProps.defaultValue = default_value;
    }

    return (
        <Select
            label={title}
            description={description}
            placeholder={placeholder}
            required={mandatory}
            data={data}
            allowDeselect={false}
            key={form.key(field_id)}
            {...inputProps}
        />
    );
};

SelectField.defaultProps = {
    placeholder: "",
};

SelectField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired
    })).isRequired,
    placeholder: PropTypes.string,
    default_value: PropTypes.string,
};

export default SelectField;

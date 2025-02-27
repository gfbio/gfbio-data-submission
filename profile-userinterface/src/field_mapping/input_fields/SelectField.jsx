import { Select } from "@mantine/core";
import PropTypes from "prop-types";

const SelectField = ({ title, description, mandatory, form, options, field_id, placeholder }) => {
    const data = options.map(opt => ({
        label: opt.option,
        value: opt.option
    }));

    return (
        <Select
            label={title}
            description={description}
            placeholder={placeholder}
            required={mandatory}
            data={data}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
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
};

export default SelectField;

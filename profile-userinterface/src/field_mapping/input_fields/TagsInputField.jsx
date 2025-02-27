import { TagsInput } from "@mantine/core";
import PropTypes from "prop-types";

const TagsInputField = ({ title, description, mandatory, form, field_id, placeholder }) => {
    return (
        <TagsInput
            label={title}
            description={description}
            placeholder={placeholder}
            required={mandatory}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
            splitChars={[',', ' ', 'Enter']}
        />
    );
};

TagsInputField.defaultProps = {
    placeholder: "",
};

TagsInputField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
};

export default TagsInputField;

import { TextInput } from "@mantine/core";
import PropTypes from "prop-types";

const TextField = ({ title, description, mandatory, form, field_id, placeholder }) => {
    return (
        <TextInput
            label={title}
            description={description}
            placeholder={placeholder}
            required={mandatory}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
        />
    );
};

TextField.defaultProps = {
    placeholder: "",
};

TextField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
};

export default TextField;

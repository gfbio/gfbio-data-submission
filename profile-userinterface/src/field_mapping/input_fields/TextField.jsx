import { TextInput } from "@mantine/core";
import PropTypes from "prop-types";
import validateTextField from "../../utils/TextValidation.jsx";
import validateDataUrlField from "../../utils/DataUrlValidation.jsx";

const TextField = ({ title, description, mandatory, form, field_id, placeholder }) => {
    form.register((values, profileData, validations) => {
        validateTextField(field_id, values, profileData, validations);
        validateDataUrlField(field_id, values, profileData, validations);
    });
    return (
        <TextInput
            label={title}
            description={description}
            placeholder={placeholder}
            required={false}
            classNames={{
                label: (mandatory ? "mandatory" : "")
            }}
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

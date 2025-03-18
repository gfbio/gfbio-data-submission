import { Textarea } from "@mantine/core";
import PropTypes from "prop-types";
import validateTextField from "../../utils/TextValidation";

const TextArea = ({ title, description, mandatory, form, field_id, placeholder }) => {
    form.register((values, profileData, validations) => {
        validateTextField(field_id, values, profileData, validations);
    });

    return (
        <Textarea
            label={title}
            description={description}
            placeholder={placeholder}
            autosize
            resize='vertical'
            minRows={7}
            classNames={{
                label: (mandatory ? "mandatory" : "")
            }}
            required={false}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
        />
    );
};

TextArea.defaultProps = {
    placeholder: "",
};

TextArea.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
};

export default TextArea;

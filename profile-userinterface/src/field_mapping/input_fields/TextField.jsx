import { TextInput } from "@mantine/core";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { mapValueToField } from "../../utils/MapValueToField";

const TextField = (props) => {
    const {title, description, mandatory, form, field_id, placeholder} = props;

    useEffect(() => {
        const submissionValue = mapValueToField(field_id);
        if (!form.values[field_id]) {
            form.setFieldValue(field_id, submissionValue || "");
        }
    }, []);

    return (
        <TextInput
            label={title}
            description={description}
            placeholder={placeholder}
            required={mandatory}
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

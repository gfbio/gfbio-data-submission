import { Textarea } from "@mantine/core";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { mapValueToField } from "../../utils/MapValueToField";

const TextArea = (props) => {
    const { title, description, form, field_id, placeholder, mandatory } = props;
    const location = useLocation();

    useEffect(() => {
        const submissionValue = mapValueToField(field_id);
        // Always set the field value, even if empty
        form.setFieldValue(field_id, submissionValue || "");
    }, [location, field_id, form]);

    return (
        <Textarea
            label={title}
            description={description}
            placeholder={placeholder}
            autosize
            resize='vertical'
            minRows={2}
            required={mandatory}
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
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    mandatory: PropTypes.bool.isRequired,
};

export default TextArea;

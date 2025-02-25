import { Textarea } from "@mantine/core";
import PropTypes from "prop-types";

const TextArea = ({ title, description, mandatory, form, field_id, placeholder }) => {
    return (
        <Textarea
            label={title}
            description={description}
            placeholder={placeholder}
            autosize
            resize='vertical'
            minRows={2}
            required={mandatory}
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

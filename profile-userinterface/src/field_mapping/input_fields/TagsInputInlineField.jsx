import { TagsInput } from "@mantine/core";
import PropTypes from "prop-types";

const TagsInputInlineField = ({ title, description, mandatory, form, field_id, placeholder }) => {
    return (
        <>
            <TagsInput
                label={title}
                description={description}
                placeholder={placeholder}
                required={mandatory}
                key={form.key(field_id)}
                {...form.getInputProps(field_id)}
                splitChars={['Enter']}
            />
            <span className="tag-hint">Enter the tag-name and press return to add the tag.</span>
        </>
    );
};

TagsInputInlineField.defaultProps = {
    placeholder: "",
};

TagsInputInlineField.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
};

export default TagsInputInlineField;

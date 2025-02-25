import { TagsInput } from "@mantine/core";
import PropTypes from "prop-types";

const RelatedPublications = ({ title, description, mandatory, form, field_id, placeholder }) => {
    const validateDOI = (value) => {
        const doiRegex = /^(https:\/doi\.org\/)?10\.\d{4,}(\.\d+)*\/[-._;()/:A-Z0-9]+$/i;
        return doiRegex.test(value) ? null : 'Please enter a valid DOI';
    };

    return (
        <TagsInput
            label={title}
            description={description}
            placeholder={placeholder || "Enter DOI (e.g., 10.1000/xyz123)"}
            required={mandatory}
            key={form.key(field_id)}
            {...form.getInputProps(field_id)}
            splitChars={[',', ' ', 'Enter']}
            validateValue={validateDOI}
        />
    );
};

RelatedPublications.defaultProps = {
    placeholder: "",
};

RelatedPublications.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
};

export default RelatedPublications;

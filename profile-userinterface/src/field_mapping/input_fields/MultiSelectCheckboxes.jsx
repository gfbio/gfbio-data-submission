import { Checkbox } from "@mantine/core";
import PropTypes from "prop-types";

const MultiSelectCheckboxes = ({ title, description, form, options, field_id }) => {
    const mapped_options = options.map((opt) => opt.option);

    return (
        <div>
            <Checkbox.Group
                label={title}
                description={description}
                key={form.key(field_id)}
                {...form.getInputProps(field_id)}
            >
                {mapped_options.map((opt, index) => (
                    <Checkbox
                        key={index}
                        value={opt}
                        label={opt}
                    />
                ))}
            </Checkbox.Group>
        </div>
    );
};

MultiSelectCheckboxes.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired
    })).isRequired,
};

export default MultiSelectCheckboxes;

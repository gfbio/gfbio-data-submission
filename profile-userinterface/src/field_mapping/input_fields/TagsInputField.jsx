import { TagsInput } from "@mantine/core";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { mapValueToField } from "../../utils/MapValueToField";

const TagsInputField = (props) => {
  const { title, description, mandatory, form, field_id, placeholder } = props;
  const [value, setValue] = useState([]);
  const location = useLocation();

  useEffect(() => {
  const submissionValue = mapValueToField(field_id);
  if (submissionValue !== "") {
    setValue(submissionValue);
    form.setFieldValue(field_id, submissionValue);
  } else {
    setValue([]);
    form.setFieldValue(field_id, []);
  }
}, [location]);

  return (
    <TagsInput
      label={title}
      description={description}
      placeholder={placeholder}
      key={form.key(field_id)}
      required={mandatory}
      {...form.getInputProps(field_id)}
      defaultValue={value}
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

import { TextInput } from "@mantine/core";
import { useField } from "@mantine/form";
import PropTypes from "prop-types";
import React from "react";

const DataUrlField = (props) => {
  const { title, description, mandatory, form, field_id, placeholder } = props;

  // Regular expression to validate URL
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

  const field = useField({
    initialValue: "",
    validateOnBlur: true,
    validate: (value) => {
      if (mandatory && value === "") {
        return "This field is required";
      } else if (value !== "" && !urlRegex.test(value)) {
        form.setFieldError(field_id, "Please enter a valid URL");
        return "Please enter a valid URL";
      } else {
        form.setFieldValue(field_id, value);
        return null;
      }
    },
  });

  return (
    <TextInput
      label={title}
      description={description}
      placeholder={placeholder}
      key={form.key(field_id)}
      required={mandatory}
      {...field.getInputProps()}
    />
  );
};

DataUrlField.defaultProps = {
  placeholder: "",
};

DataUrlField.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  mandatory: PropTypes.bool.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

export default DataUrlField;

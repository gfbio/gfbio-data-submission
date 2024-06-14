import { TextInput } from "@mantine/core";
import { useField } from "@mantine/form";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";

const DataUrlField = (props) => {
  const { title, description, mandatory, form, field_id, placeholder } = props;

  // Regular expression to validate URL
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

  const [value, setValue] = useState();

  useEffect(() => {
    form.setFieldValue(field_id, value);
  });

  const field = useField({
    initialValue: "",
    validateOnBlur: true,
    validate: (value) => {
      if (mandatory && value === "") {
        return "This field is required";
      } else if (value !== "" && !urlRegex.test(value)) {
        return "Please enter a valid URL";
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
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
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

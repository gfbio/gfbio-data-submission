import { TextInput } from "@mantine/core";
import PropTypes from "prop-types";
import React from "react";

const TextField = (props) => {
  const { title, description, mandatory, form, field_id, placeholder } = props;

  return (
    <TextInput
      label={title}
      description={description}
      placeholder={placeholder}
      key={form.key(field_id)}
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

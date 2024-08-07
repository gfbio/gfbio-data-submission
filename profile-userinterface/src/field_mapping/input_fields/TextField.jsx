import { TextInput } from "@mantine/core";
import PropTypes from "prop-types";
import React from "react";

const TextField = (props) => {
  const { title, description, mandatory, form, field_id, placeholder } = props;
  const submission = JSON.parse(localStorage.getItem("submission"));
  let value = "";
  if (Object.keys(submission).length > 0) {
    const requirements = Object.keys(submission.data.requirements);
    const key = field_id;
    if (requirements.includes(key)) {
      value = submission.data.requirements[key];
    }
  }

  return (
    <TextInput
      label={title}
      description={description}
      placeholder={placeholder}
      key={form.key(field_id)}
      required={mandatory}
      {...form.getInputProps(field_id)}
      value={value}
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

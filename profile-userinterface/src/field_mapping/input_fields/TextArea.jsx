import { Textarea } from "@mantine/core";
import PropTypes from "prop-types";
import React from "react";

const TextArea = (props) => {
  const { title, description, form, field_id, placeholder, mandatory } = props;
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
    <Textarea
      label={title}
      description={description}
      placeholder={placeholder}
      autosize
      resize="vertical"
      minRows={2}
      key={form.key(field_id)}
      required={mandatory}
      {...form.getInputProps(field_id)}
      value={value}
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
};

export default TextArea;

import { Textarea } from "@mantine/core";
import PropTypes from "prop-types";
import React, { useEffect } from "react";
import { mapValueToField } from "../../utils/MapValueToField";

const TextArea = (props) => {
  const { title, description, form, field_id, placeholder, mandatory } = props;

  let value = mapValueToField(field_id);

  useEffect(() => {
    form.setFieldValue(field_id, value);
  }, []);

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
      defaultValue={value}
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
  mandatory: PropTypes.bool.isRequired,
};

export default TextArea;

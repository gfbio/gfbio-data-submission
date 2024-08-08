import { Select } from "@mantine/core";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { mapValueToField } from "../../utils/MapValueToField";

const SelectField = (props) => {
  const { title, description, form, options, field_id } = props;

  const mapped_options = options.map((opt) => opt.option);

  // TODO: add parameter to be able to switch between this and empty values if select is
  //  initally empty (or has placeholder)

  // setting inital values, so that there is always a value for the field in the form
  //  even if nothing is actively selected (e.g. GFBio-Datacenter...).
  const submissionValue = mapValueToField(field_id);
  let initialOption = options.at(0).option;
  if (submissionValue !== "") {
    initialOption = options.find((opt) => opt.option === submissionValue);
    initialOption = initialOption.option;
  }
  const [value, setValue] = useState(initialOption);

  useEffect(() => {
    form.setFieldValue(field_id, value);
  }, []);

  //TODO: this could be used for any field that deals with options
  const handleChange = (option) => {
    setValue(option.value);
    form.setFieldValue(field_id, option.value);
  };

  return (
    <Select
      label={title}
      description={description}
      // placeholder={default}
      data={mapped_options}
      defaultValue={value}
      onChange={(_value, option) => handleChange(option)}
      searchable
    />
  );
};

SelectField.defaultProps = {
  // default: "",
};

SelectField.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  form: PropTypes.object.isRequired,
  field_id: PropTypes.string.isRequired,
  // default: PropTypes.string,
  options: PropTypes.array,
};

export default SelectField;

import PropTypes from "prop-types";
import React from "react";
import CollapsibleSelector from "./input_fields/CollapsibleSelector.jsx";
import DropzoneUpload from "./input_fields/DropzoneUpload.jsx";
import EmbargoDate from "./input_fields/EmbargoDate.jsx";
import InfoBox from "./input_fields/InfoBox.jsx";
import MetadataTemplate from "./input_fields/MetadataTemplate.jsx";
import MultiSelectCheckboxes from "./input_fields/MultiSelectCheckboxes.jsx";
import MultiSelectDropdown from "./input_fields/MultiSelectDropdown.jsx";
import SelectField from "./input_fields/SelectField.jsx";
import TagsInputField from "./input_fields/TagsInputField.jsx";
import TextArea from "./input_fields/TextArea.jsx";
import TextField from "./input_fields/TextField.jsx";

const FormField = ({ field, form, onFilesChange }) => {
  const fieldParameters = {
    title: field.title,
    description: field.description,
    default_value: field.default,
    mandatory: field.mandatory,
    options: field.options,
    field_id: field.field_id,
    placeholder: field.placeholder,
    form: form,
  };

  switch (field.field_type.type) {
    case "text-field":
      return <TextField {...fieldParameters}></TextField>;
    case "text-area":
      return <TextArea {...fieldParameters}></TextArea>;
    case "select-field":
      return <SelectField {...fieldParameters}></SelectField>;
    case "file-upload":
      // TODO: Work in progress...
      return (
        <DropzoneUpload
          {...fieldParameters}
          onFilesChange={onFilesChange}
        ></DropzoneUpload>
      );
    case "collapsible-selector":
      return <CollapsibleSelector {...fieldParameters}></CollapsibleSelector>;
    case "metadata-template":
      return <MetadataTemplate {...fieldParameters}></MetadataTemplate>;
    case "info-box":
      return <InfoBox {...fieldParameters}></InfoBox>;
    case "multiselect-checkboxes":
      return (
        <MultiSelectCheckboxes {...fieldParameters}></MultiSelectCheckboxes>
      );
    case "multiselect-dropdown":
      return <MultiSelectDropdown {...fieldParameters}></MultiSelectDropdown>;
    case "embargo-date-picker":
      return <EmbargoDate {...fieldParameters}></EmbargoDate>;
    case "data-url-field":
      return <TextField {...fieldParameters}></TextField>;
    case "tags-input":
      return <TagsInputField {...fieldParameters}></TagsInputField>;
    default:
      return <TextField {...fieldParameters}></TextField>;
  }
};

FormField.propTypes = {
  field: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  onFilesChange: PropTypes.func.isRequired,
};

export default FormField;

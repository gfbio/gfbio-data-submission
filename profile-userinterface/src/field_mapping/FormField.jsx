import PropTypes from "prop-types";
import CollapsibleSelector from "./input_fields/CollapsibleSelector.jsx";
import Contributors from "./input_fields/Contributors.jsx";
import DropzoneUpload from "./input_fields/DropzoneUpload.jsx";
import EmbargoDate from "./input_fields/EmbargoDate.jsx";
import InfoBox from "./input_fields/InfoBox.jsx";
import MetadataTemplate from "./input_fields/MetadataTemplate.jsx";
import MultiSelectCheckboxes from "./input_fields/MultiSelectCheckboxes.jsx";
import MultiSelectDropdown from "./input_fields/MultiSelectDropdown.jsx";
import RelatedPublications from "./input_fields/RelatedPublications.jsx";
import SelectField from "./input_fields/SelectField.jsx";
import TagsInputField from "./input_fields/TagsInputField.jsx";
import TextArea from "./input_fields/TextArea.jsx";
import TextField from "./input_fields/TextField.jsx";

const FormField = ({formField, form, onFilesChange}) => {
    const fieldParameters = {
        title: formField.field.title,
        description: formField.field.description,
        default_value: formField.default,
        visible: formField.visible,
        mandatory: formField.mandatory,
        options: formField.field.options,
        field_id: formField.field.field_id,
        placeholder: formField.field.placeholder,
        form: form,
    };

    if (formField.visible) {
        switch (formField.field.field_type.type) {
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
            case "related-publications":
                return <RelatedPublications {...fieldParameters}></RelatedPublications>;
            case "contributors":
                return <Contributors {...fieldParameters}></Contributors>;
            default:
                return <TextField {...fieldParameters}></TextField>;
        }
    }
};

FormField.propTypes = {
    formField: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    onFilesChange: PropTypes.func,
};

export default FormField;

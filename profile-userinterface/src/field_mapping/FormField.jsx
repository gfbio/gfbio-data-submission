import React from 'react';
import PropTypes from 'prop-types';
import TextField from "./input_fields/TextField.jsx";
import TextArea from "./input_fields/TextArea.jsx";
import DropzoneUpload from "./input_fields/DropzoneUpload.jsx";
import SelectField from "./input_fields/SelectField.jsx";
import CollapsibleSelector from "./input_fields/CollapsibleSelector.jsx"

const FormField = ({field, form}) => {

    // console.log('FormField: ');
    // console.log('\t', field);
    // console.log('-----------------------\n');

    const fieldParameters = {
        title: field.title,
        description: field.description,
        default_value: field.default,
        mandatory: field.mandatory,
        options: field.options,
        field_id: field.field_id,
        form: form,
    }

    switch (field.field_type.type) {
        case 'text-field':
            return <TextField {...fieldParameters}></TextField>;
        case 'text-area':
            return <TextArea {...fieldParameters}></TextArea>
        case 'select-field':
            return <SelectField {...fieldParameters}></SelectField>;
        case 'file-upload':
            // TODO: Work in progress...
            return <DropzoneUpload {...fieldParameters}></DropzoneUpload>
        case 'collapsible-selector':
            return <CollapsibleSelector {...fieldParameters}></CollapsibleSelector>
        default:
            return <TextField {...fieldParameters}></TextField>;

    }
};

FormField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
}

export default FormField;
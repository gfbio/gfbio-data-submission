import React from 'react';
import PropTypes from 'prop-types';
import TextField from "./input_fields/TextField.jsx";
import TextArea from "./input_fields/TextArea.jsx";

const FormField = ({field, form}) => {

    const fieldParameters = {
        title: field.title,
        description: field.description,
        field_id: field.field_id,
        form: form,
    }

    switch (field.field_type.type) {
        case 'text-field':
            return <TextField {...fieldParameters}></TextField>;
        case 'text-area':
            return <TextArea {...fieldParameters}></TextArea>
        // case 'file-upload':
        //     // TODO: Work in progress...
        //     return <DropzoneUpload {...fieldParameters}></DropzoneUpload>
        default:
            return <TextField {...fieldParameters}></TextField>;

    }
};

FormField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
}

export default FormField;

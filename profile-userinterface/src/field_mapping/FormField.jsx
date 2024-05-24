import React from 'react';
import PropTypes from 'prop-types';
import TextField from "./input_fields/TextField.jsx";
import TextArea from "./input_fields/TextArea.jsx";

const FormField = ({field, form}) => {
    // const type = field.field_type.type;
    // console.log('############# Formfield f: ', field);

    const fieldParameters = {
        title: field.title,
        description: field.description,
        field_id: field.field_id,
        form: form,
    }
    // console.log('FORMFIELD fieldparameters ', fieldParameters);

    switch (field.field_type.type) {
        case 'text-field':
            return <TextField {...fieldParameters}></TextField>;
        case 'text-area':
            return <TextArea {...fieldParameters}></TextArea>
        default:
            return <TextField {...fieldParameters}></TextField>;

    }
};

FormField.propTypes = {
    field: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
}

export default FormField;

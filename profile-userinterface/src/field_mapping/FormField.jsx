import React from 'react';
import PropTypes from 'prop-types';
import TextField from "./input_fields/TextField.jsx";
import {TextInput} from "@mantine/core";
import TextArea from "./input_fields/TextArea.jsx";

const FormField = (field) => {
    // const type = field.field_type.type;
    const f = field.field;
    console.log('############# Formfield f: ', f);

    switch (f.field_type.type) {
        case 'text-field':
            return <TextField title={f.title} description={f.description}></TextField>;
        case 'text-area':
            return <TextArea title={f.title} description={f.description}></TextArea>
        default:
            return <p>TEXTFIELD (default)</p>;

    }
};

FormField.propTypes = {
    field: PropTypes.object.isRequired
}

export default FormField;

import React from 'react';
import PropTypes from 'prop-types';
import TextField from "./input_fields/TextField.jsx";
import {TextInput} from "@mantine/core";

const FormField = (field) => {
    // const type = field.field_type.type;
    const f = field.field;
    console.log('############# Formfield f: ', f);

    switch (f.field_type.type) {
        case 'text-field':
            // return <TextInput
            //     label={f.title}
            //     description={f.description}
            //     placeholder={"initialValue"}
            // />
            return <TextField title={f.title} description={f.description}></TextField>;
        // return <p>TEXT_FIELD</p>
        case 'text-area':
            return <p>TEXT_AREA</p>;
        default:
            return <p>TEXTFIELD (default)</p>;

    }
};

FormField.propTypes = {
    field: PropTypes.object.isRequired
}

export default FormField;

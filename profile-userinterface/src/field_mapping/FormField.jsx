import React from 'react';
import PropTypes from 'prop-types';
import TextField from "./input_fields/TextField.jsx";

const FormField = (field_type) => {
    const type = field_type.field_type.type;
    console.log('Formfield type: ', type);

    switch (type) {
        case 'text-field':
            return <TextField></TextField>;
        case 'text-area':
            return <p>TEXT_AREA</p>;
        default:
            return <p>TEXTFIELD (default)</p>;

    }
};

FormField.propTypes = {
    field_type: PropTypes.object.isRequired
}

export default FormField;

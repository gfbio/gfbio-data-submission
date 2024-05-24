import React from 'react';
import PropTypes from 'prop-types';

const FormField = (type) => {

    return (
        <p>{type}</p>
    );
};

FormField.propTypes = {
    type: PropTypes.string.isRequired
}

export default FormField;

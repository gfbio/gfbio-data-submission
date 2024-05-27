import React from 'react';
import PropTypes from "prop-types";


const DropzoneUpload= (props) => {

    const {title, description, form, field_id, } = props;

    return (
        <>
            <h4>UPLOAD ...</h4>
        </>
    );
}

DropzoneUpload.defaultProps = {

}

DropzoneUpload.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
}

export default DropzoneUpload;

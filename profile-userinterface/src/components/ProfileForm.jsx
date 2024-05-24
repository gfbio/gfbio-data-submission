import React from 'react';
import PropTypes from "prop-types";
import FormField from "../field_mapping/FormField.jsx";

const ProfileForm = ({data}) => {

    return (
        <>
            <h2>Name: {data.name}</h2>
            <h3>Target: {data.target}</h3>
            <h4>Fields: </h4>
            <div>
                {data.fields.map((field, index) => (
                    <div key={index}>
                        <h5>TITLE: {field.title}</h5>
                        <h5>DESC: {field.description}</h5>
                        <h5>ID: {field.field_id}</h5>
                        <FormField field={field}></FormField>
                    </div>
                ))}
            </div>
        </>
    );
};

ProfileForm.propTypes = {
    data: PropTypes.object.isRequired
}

export default ProfileForm;

import React from 'react';
import PropTypes from "prop-types";

const Profile = ({data}) => {

    return (
        <>
            <h3>Name: {data.name}</h3>
            <h4>Target: {data.target}</h4>
            <h5>Fields: </h5>
            <div>
            {data.fields.map((field, index) => (
                <ul  key={index}>
                    <ul>
                        <li>
                            Title: {field.title}
                        </li>
                        <li>Description: {field.description}</li>
                        <li>Field-id: {field.field_id}</li>
                        <li>FieldType type: {field.field_type.type}</li>
                    </ul>
                </ul>
            ))}
            </div>
        </>
    );
};

Profile.propTypes = {
    data: PropTypes.object.isRequired
}

export default Profile;

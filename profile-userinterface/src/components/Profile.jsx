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
                    <ul className="list-group" key={index}>
                        <ul>
                            <li className="list-group-item">
                                Title: {field.title}
                            </li>
                            <li className="list-group-item">Description: {field.description}</li>
                            <li className="list-group-item">Field-id: {field.field_id}</li>
                            <li className="list-group-item">FieldType type: {field.field_type.type}</li>
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

import React from 'react';
import PropTypes from "prop-types";
import FormField from "../fieldmapping/FormField.jsx";

const Profile = ({data}) => {

    // console.log(data.fields.length > 0);
    return (
        <>
            <h3>Name: {data.name}</h3>
            <h4>Target: {data.target}</h4>
            <h5>Fields: </h5>
            <div>
                {data.fields.map((field, index) => (
                    /* <ul className="list-group" key={index}>
                         <ul>
                             <li className="list-group-item">
                                 Title: {field.title}
                             </li>
                             <li className="list-group-item">Description: {field.description}</li>
                             <li className="list-group-item">Field-id: {field.field_id}</li>
                             <li className="list-group-item">FieldType type: {field.field_type.type}</li>
                         </ul>
                     </ul>*/
                    // <FormField type={field.field_type.type}></FormField>
                    <div key={index}>
                        <h4>{index}</h4>
                        <p>{field.field_type.type}</p>
                    </div>
                ))}
            </div>
        </>
    );


};

Profile.propTypes = {
    data: PropTypes.object.isRequired
}

export default Profile;

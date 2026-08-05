export default function validateTextField(field_id, values, profileData, validations) {
  let field = profileData.form_fields.find(
    ({ field }) => field.field_id === field_id
  );
  let value = values[field_id];
  if (field.mandatory && !value) {
    validations[field_id] = "This field is required. Please fill it in before submitting.";
  }
  else if (field_id == "title" && value && value.length < 5) {
      validations[field_id] = "The title is too short. Please enter at least 5 characters.";
  }
  else if (field_id == "description" && value && value.length < 10) {
      validations[field_id] = "The description is too short. Please enter at least 10 characters.";
  }
}

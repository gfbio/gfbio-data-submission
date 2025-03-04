export default function validateTextField(field_id, values, profileData, validations) {
  let fields = profileData.form_fields.filter(
    ({ field }) => (field.field_type.type === "text-field" || field.field_type.type === "text-area")
  );
  let field = profileData.form_fields.find(
    ({ field }) => field.field_id === field_id
  );
  let value = values[field_id];
  if (mandatory && !value) {
    validations[field_id] = "This field is required";
  }
  else if (field_id == "title" && value && value.length < 5) {
      validations[field_id] = "The title is too short";
  }
  else if (field_id == "description" && value && value.length < 10) {
      validations[field_id] = "The description is too short";
  }
}
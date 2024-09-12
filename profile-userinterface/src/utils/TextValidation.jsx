export default function validateTextFields(values, profileData, validations) {
  let fields = profileData.form_fields.filter(
    ({ field }) => (field.field_type.type === "text-field" || field.field_type.type === "text-area")
  );
  fields.forEach(field => {
    let field_id = field.field.field_id;
    let value = values[field_id];
    if (field_id == "title" && value && value.length < 6) {
      validations[field_id] = "The title is too short";
    }
    if (field_id == "description" && value && value.length < 10) {
      validations[field_id] = "The description is too short";
    }
  })
}
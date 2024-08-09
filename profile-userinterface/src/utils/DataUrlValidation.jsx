function isValidUrl(url) {
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
}

export default function validateDataUrlField(values, profileData) {
  let field = profileData.form_fields.find(
    ({ field }) => field.field_type.type === "data-url-field"
  );
  let field_id = field.field_id;
  let value = values[field_id];
  if (field.mandatory === "true" || (value !== undefined && value !== "")) {
    return {
      [field_id]: isValidUrl(value) ? null : "Please enter a valid URL",
    };
  } else {
    return null;
  }
}

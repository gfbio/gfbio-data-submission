export function mapValueToField(field_id) {
  let value = "";
  const submission = JSON.parse(localStorage.getItem("submission"));
  if (Object.keys(submission).length === 0) {
    return value;
  }
  const requirements = Object.keys(submission.data.requirements);
  const key = field_id;
  if (requirements.includes(key)) {
    value = submission.data.requirements[key];
  }

  return value;
}

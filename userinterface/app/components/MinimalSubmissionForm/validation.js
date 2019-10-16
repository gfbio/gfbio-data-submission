export const required = value =>
  value || typeof value === 'number' ? undefined : 'This field is required';

export const minLength = min => value =>
  value && value.length < min
    ? `Please enter at least ${min} characters or more`
    : undefined;

export const minLength2 = minLength(2);

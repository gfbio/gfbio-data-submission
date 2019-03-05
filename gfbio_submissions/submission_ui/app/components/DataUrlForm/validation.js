export const urlValidation = value =>
  value && !/^(?:(?:https?|ftp|sftp|file):\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/i.test(value)
    ? 'Invalid Url'
    : undefined;

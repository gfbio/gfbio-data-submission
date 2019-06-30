// TODO: no api root needed if app is on same host with django
// export const API_ROOT = '';
// TODO: elsewhere:
// export const API_ROOT = 'https://submission.gfbio.org';
// TODO: for rapid js standalone development, full servername is needed though.
export const API_ROOT = 'http://0.0.0.0:8000';

// TODO: check/remove fallback values of userid, token, etc. in reducers

export const USER_URL = 'user/';
// TODO: merge redundant code of api-access-code like in this file
export const SUBMISSIONS = '/api/submissions/';
export const UPLOAD = '/upload/';
export const UPLOADS = '/uploads/';
export const UPLOAD_PATCH = 'patch/';

export const STATUS_CANCELLED = 'CANCELLED';

export const MAX_UPLOAD_ITEMS = 20;
export const MAX_TOTAL_UPLOAD_SIZE = 200000000;  // 200 MB = 200000000 bytes

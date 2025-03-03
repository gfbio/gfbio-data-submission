// TODO: add local dev prefix automatically without the need to set this explicitly
// export const SERVER_ROOT = "";
export const SERVER_ROOT = 'http://0.0.0.0:8000/';

// use as base url for router in main.jsx to allow development with hot reload
//  and "npm run dev"
export const LOCAL_ROUTER_BASE_URL = "/";

export const PROFILE_URL_PREFIX = "/profile/";

export const ROUTER_BASE_URL = PROFILE_URL_PREFIX + "ui/";

export const DEFAULT_PROFILE_NAME = "gfbio";

//TODO: fix ugly url later
export const PROFILE_URL = SERVER_ROOT + PROFILE_URL_PREFIX + "profile/";

export const SUBMISSIONS_API = SERVER_ROOT + "/api/submissions/";

export const JIRA_ROOT = "https://helpdesk.gfbio.org/browse/";

export const UPLOAD = "/upload/";

export const UPLOAD_PATCH = "patch/";

export const UPLOADS = "/uploads/";

export const MAX_UPLOAD_ITEMS = 20;

export const MAX_TOTAL_UPLOAD_SIZE = 10000000000;  // 10 GB = 10000000000 bytes

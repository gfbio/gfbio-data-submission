// TODO: add local dev prefix automatically without the need to set this explicitly
export const SERVER_ROOT = "";
// export const SERVER_ROOT = 'http://0.0.0.0:8000/';

// use as base url for router in main.jsx to allow development with hot reload
//  and "npm run dev"
export const LOCAL_ROUTER_BASE_URL = "/";
// local token, if you want to develop locally with hot-reloading in a javascript only environment
export const LOCAL_API_TOKEN = "6e9f1d95d5bb666d327b59c16534591250ee4d60"

export const PROFILE_URL_PREFIX = "/profile/";

export const ROUTER_BASE_URL = PROFILE_URL_PREFIX + "ui/";

// TODO: handle dynamic, get default from server (global default field there ?)
export const DEFAULT_PROFILE_NAME = "gfbio";
export const DEFAULT_PROFILE_ID = "1";

//TODO: fix ugly url later
export const PROFILE_URL = SERVER_ROOT + PROFILE_URL_PREFIX + "profile/";

export const PROFILE_LIST_URL = SERVER_ROOT + PROFILE_URL_PREFIX + "profiles/?system_wide_profile=true";

export const ACTIVE_PROFILE_URL = SERVER_ROOT + PROFILE_URL_PREFIX + "active/";

export const SUBMISSIONS_API = SERVER_ROOT + "/api/submissions/";

export const JIRA_ROOT = "https://helpdesk.gfbio.org/browse/";

export const UPLOAD = "/upload/";

export const UPLOAD_PATCH = "patch/";

export const UPLOADS = "/uploads/";

export const MAX_UPLOAD_ITEMS = 20;

export const MAX_TOTAL_UPLOAD_SIZE = 10000000000;  // 10 GB = 10000000000 bytes

export const PROFILE_SELECTION_FORM_KEY = "profileSelect";

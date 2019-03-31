import axios from 'axios';

// TODO: no api root needed if app is on same host with django
// const API_ROOT = 'https://submission.gfbio.org';
// TODO: for rapid js standalone development, full servername is needed though.
const API_ROOT = 'http://0.0.0.0:8000';

// TODO: merge redundant code of api-access-code like in this file
const SUBMISSIONS = '/api/submissions/';
const USER_URL = 'user/';

export function getSubmissions(token, userId) {

  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };

  // TODO: remove API_ROOT compare above TODOs
  console.log(`${API_ROOT + SUBMISSIONS + USER_URL + userId}/`);
  return axios.get(
    `${API_ROOT + SUBMISSIONS + USER_URL + userId}/`,
    config,
  );

}

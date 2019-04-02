import axios from 'axios';
import { API_ROOT, SUBMISSIONS, USER_URL } from '../../globalConstants';

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

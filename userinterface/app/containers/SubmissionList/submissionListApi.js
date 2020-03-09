import axios from 'axios';
import { API_ROOT, SUBMISSIONS } from '../../globalConstants';

export function getSubmissions(token, userId) {

  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };

  // TODO: remove API_ROOT compare above TODOs
  // console.log(`${API_ROOT + SUBMISSIONS + USER_URL + userId}/`);
  return axios.get(
    `${API_ROOT + SUBMISSIONS}`,
    config,
  );

}

export const requestDeleteSubmission = (token, brokerSubmissionId) => {
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };
  return axios.delete(
    `${API_ROOT + SUBMISSIONS + brokerSubmissionId}/`,
    config,
  );
};


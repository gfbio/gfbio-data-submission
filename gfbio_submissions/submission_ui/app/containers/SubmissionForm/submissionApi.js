import axios from 'axios';

// TODO: no api root needed if app is on same host with django
// const API_ROOT = 'https://submission.gfbio.org';
// TODO: for rapid js standalone development, full servername is needed though.
//const API_ROOT = 'http://0.0.0.0:8000';

const SUBMISSIONS = '/api/submissions/';

export const postSubmission = (token, data_body) => {

  const instance = axios.create({
    // TODO: remove API_ROOT compate above TODOs
    // baseURL: API_ROOT + SUBMISSIONS,
    baseURL: SUBMISSIONS,
    headers: {
      'Authorization': 'Token ' + token,
      'Content-Type': 'application/json',
    },
  });

  return instance.post('', data_body);
  // .then(function(response) {
  //   console.log(response);
  // })
  // .catch(function(error) {
  //   console.log(error);
  // });

};

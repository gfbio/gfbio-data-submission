import axios from 'axios';

// const API_ROOT = 'https://submission.gfbio.org';
const SUBMISSIONS = '/api/submissions/';

export const postSubmission = () => {

  console.log('postSubmission');


  const instance = axios.create({
    baseURL: SUBMISSIONS,
    headers: {
      'Authorization': 'Token ' + token,
      'Content-Type': 'application/json',
    },
  });

  return instance.post('', { name: 'Fred' });
  // .then(function(response) {
  //   console.log(response);
  // })
  // .catch(function(error) {
  //   console.log(error);
  // });

};

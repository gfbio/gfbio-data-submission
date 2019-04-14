import axios from 'axios';
import { END, eventChannel } from 'redux-saga';
import { API_ROOT, SUBMISSIONS, UPLOAD, USER_URL } from '../../globalConstants';

export const postSubmission = (token, dataBody) => {

  const instance = axios.create({
    // TODO: remove API_ROOT compate above TODOs
    baseURL: API_ROOT + SUBMISSIONS,
    // baseURL: SUBMISSIONS,
    headers: {
      'Authorization': 'Token ' + token,
      'Content-Type': 'application/json',
    },
  });

  return instance.post('', dataBody);
  // .then(function(response) {
  //   console.log(response);
  // })
  // .catch(function(error) {
  //   console.log(error);
  // });

};

export const putSubmission = (token, brokerSubmissionId, dataBody) => {
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
      'Content-Type': 'application/json',
    },
  };
  return axios.put(
    `${API_ROOT + SUBMISSIONS + brokerSubmissionId}/`,
    dataBody,
    config,
  );
};

export const getSubmission = (token, brokerSubmissionId) => {
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };
  return axios.get(
    `${API_ROOT + SUBMISSIONS + brokerSubmissionId}/`,
    config,
  );
};

// export const requestDeleteSubmission = (token, brokerSubmissionId) => {
//   const config = {
//     headers: {
//       'Authorization': 'Token ' + token,
//     },
//   };
//   return axios.delete(
//     `${API_ROOT + SUBMISSIONS + brokerSubmissionId}/`,
//     config,
//   );
// };

// TODO: https://decembersoft.com/posts/file-upload-progress-with-redux-saga/

export const postFile = (token, brokerSubmissionId, file) => {
  let formData = new FormData();
  formData.append('file', file);

  // TODO: go for config object variant, compare below
  const instance = axios.create({
    // TODO: remove API_ROOT compare above TODOs
    baseURL: API_ROOT + SUBMISSIONS + brokerSubmissionId + UPLOAD,
    headers: {
      'Authorization': 'Token ' + token,
    },
    // onUploadProgress: progressEvent => {
    //   let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
    //   console.log('progress: ', progressEvent.loaded, ' percent completed ', percentCompleted);
    // },
  });
  return instance.post('', formData);

  // // TODO: this works too
  // const config = {
  //   headers: {
  //     'Authorization': 'Token ' + token,
  //   },
  //   // onUploadProgress: progressEvent => {
  //   //   let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
  //   //   console.log('progress: ', progressEvent.loaded, ' percent completed ', percentCompleted);
  //   // },
  // };
  // return axios.post(API_ROOT + SUBMISSIONS + brokerSubmissionId + '/upload/', formData, config);
};


// TODO: from: https://gist.github.com/jpgorman/f49501076a13cecfaa17d30e8d569be0
export function createUploadFileChannel(brokerSubmissionId, file, token) {
  return eventChannel(emit => {
    let formData = new FormData();
    formData.append('file', file);

    // const onProgress = ({ total, loaded }) => {
    //   const progress = Math.round((loaded * 100) / total);
    //   emit(progress);
    // };

    const config = {
      headers: {
        'Authorization': 'Token ' + token,
      },
      onUploadProgress: progressEvent => {
        let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        emit(percentCompleted);
      },
    };
    axios.post(
      API_ROOT + SUBMISSIONS + brokerSubmissionId + UPLOAD,
      formData,
      config,
    ).then(() => {
      // console.log('channel. fulfilled emit END');
      emit(END);
    }).catch(err => {
      emit(new Error(err.message));
      // console.log('channel. Error emit END');
      emit(END);
    });
    const unsubscribe = () => {
      // console.log('channel. UNSUBSCRIBE');
    };
    return unsubscribe;
  });
}

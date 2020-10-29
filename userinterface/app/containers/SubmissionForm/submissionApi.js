import axios from 'axios';
import { END, eventChannel } from 'redux-saga';
import {
  API_ROOT, COMMENT,
  SUBMISSIONS,
  UPLOAD,
  UPLOAD_PATCH,
  UPLOADS,
} from '../../globalConstants';


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

export const postComment = (token, brokerSubmissionId, commentText) => {
  const instance = axios.create({
    // TODO: remove API_ROOT compate above TODOs
    baseURL: API_ROOT + SUBMISSIONS + brokerSubmissionId + COMMENT,
    headers: {
      'Authorization': 'Token ' + token,
      'Content-Type': 'application/json',
    },
  });
  let formData = new FormData();
  formData.append('comment', commentText);
  return instance.post('', formData);
};

export const getSubmissionUploads = (token, brokerSubmissionId) => {
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };
  return axios.get(
    `${API_ROOT + SUBMISSIONS + brokerSubmissionId + UPLOADS}`,
    config,
  );
};

// /api/submissions/a2ac6fe5-1eaa-474b-b69e-3af22c38ad9c/upload/1/
export const deleteSubmissionUpload = (token, brokerSubmissionId, fileKey) => {
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };
  return axios.delete(
    `${API_ROOT + SUBMISSIONS + brokerSubmissionId + UPLOAD + fileKey}`,
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

export const setMetaDataFlag = (brokerSubmissionId, fileKey, meta_data, token) => {
  let formData = new FormData();
  formData.append('meta_data', meta_data);
  formData.append('attach_to_ticket', false);
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
  };
  const url = `${API_ROOT + SUBMISSIONS + brokerSubmissionId + UPLOAD + UPLOAD_PATCH + fileKey + '/'}`;
  return axios.patch(
    url,
    formData,
    config,
  );
};

// TODO: from: https://gist.github.com/jpgorman/f49501076a13cecfaa17d30e8d569be0
export function createUploadFileChannel(brokerSubmissionId, file, attach_to_ticket, meta_data, token) {
  return eventChannel(emit => {
    let formData = new FormData();
    formData.append('file', file);
    formData.append('attach_to_ticket', attach_to_ticket);
    formData.append('meta_data', meta_data);

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
      emit(END);
    }).catch(err => {
      emit(new Error(err.message));
      emit(END);
    });
    const unsubscribe = () => {
    };
    return unsubscribe;
  });
}

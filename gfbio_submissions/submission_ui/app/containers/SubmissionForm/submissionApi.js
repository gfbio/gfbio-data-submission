import axios from 'axios';
import { buffers, END, eventChannel } from 'redux-saga';
// TODO: no api root needed if app is on same host with django
// const API_ROOT = 'https://submission.gfbio.org';
// TODO: for rapid js standalone development, full servername is needed though.
const API_ROOT = 'http://0.0.0.0:8000';

const SUBMISSIONS = '/api/submissions/';

export const postSubmission = (token, data_body) => {

  const instance = axios.create({
    // TODO: remove API_ROOT compate above TODOs
    baseURL: API_ROOT + SUBMISSIONS,
    // baseURL: SUBMISSIONS,
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


// TODO: https://decembersoft.com/posts/file-upload-progress-with-redux-saga/

// r'submissions/(?P<broker_submission_id>[0-9a-z-]+)/upload/$',
export const postFile = (token, brokerSubmissionId, file) => {
  let formData = new FormData();
  formData.append('file', file);

  // console.log('postFile');
  // console.log(file);
  // file.progress = 60;

  // const instance = axios.create({
  //   // TODO: remove API_ROOT compare above TODOs
  //   baseURL: API_ROOT + SUBMISSIONS + brokerSubmissionId + '/upload/',
  //   headers: {
  //     'Authorization': 'Token ' + token,
  //   },
  //   onUploadProgress: progressEvent => {
  //     let percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
  //     console.log('progress: ', progressEvent.loaded, ' percent completed ', percentCompleted);
  //   },
  // });
  // return instance.post('', formData);

  // TODO: this works too
  const config = {
    headers: {
      'Authorization': 'Token ' + token,
    },
    onUploadProgress: progressEvent => {
      let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      console.log('progress: ', progressEvent.loaded, ' percent completed ', percentCompleted);
    },
  };
  return axios.post(API_ROOT + SUBMISSIONS + brokerSubmissionId + '/upload/', formData, config);
};


export function createUploadFileChannel(brokerSubmissionId, file, token) {
  return eventChannel(emit => {
    let formData = new FormData();
    formData.append('file', file);

    // TODO: from: https://gist.github.com/jpgorman/f49501076a13cecfaa17d30e8d569be0

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
        // console.log('progress: ', progressEvent.loaded, ' percent completed ', percentCompleted);
        emit(percentCompleted);
      },
    };
    axios.post(
      API_ROOT + SUBMISSIONS + brokerSubmissionId + '/upload/',
      formData,
      config,
    ).then(() => {
      console.log('channel. fulfilled emit END');
      emit(END);
    }).catch(err => {
      emit(new Error(err.message));
      console.log('channel. Error emit END');
      emit(END);
    });

    // axios.post('url', files, {
    //   requestId: key,
    //   uploadProgress: onProgress,
    // }).then(() => {
    //   emit(END)
    // }).catch(err => {
    //   emit(new Error(err.message))
    //   emit(END)
    // });

    const unsubscribe = () => {
      console.log('channel. UNSUBSCRIBE');
    };
    return unsubscribe;
  });
  // return eventChannel(emitter => {
  //   const xhr = new XMLHttpRequest();
  //   const onProgress = (e) => {
  //     if (e.lengthComputable) {
  //       const progress = e.loaded / e.total;
  //       emitter({ progress });
  //     }
  //   };
  //   const onFailure = (e) => {
  //     emitter({ err: new Error('Upload failed') });
  //     emitter(END);
  //   };
  //   xhr.upload.addEventListener('progress', onProgress);
  //   xhr.upload.addEventListener('error', onFailure);
  //   xhr.upload.addEventListener('abort', onFailure);
  //   xhr.onreadystatechange = () => {
  //     const { readyState, status } = xhr;
  //     if (readyState === 4) {
  //       if (status === 200) {
  //         emitter({ success: true });
  //         emitter(END);
  //       } else {
  //         onFailure(null);
  //       }
  //     }
  //   };
  //   xhr.open('POST', endpoint, true);
  //   xhr.setRequestHeader('Authorization', 'Token ' + token);
  //   let formData = new FormData();
  //   formData.append('file', file);
  //   xhr.send(formData);
  //   return () => {
  //     xhr.upload.removeEventListener('progress', onProgress);
  //     xhr.upload.removeEventListener('error', onFailure);
  //     xhr.upload.removeEventListener('abort', onFailure);
  //     xhr.onreadystatechange = null;
  //     xhr.abort();
  //   };
  // }, buffers.sliding(2));
}

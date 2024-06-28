import axios from "axios";
import { SUBMISSIONS_API, UPLOAD } from "../settings.jsx";

const uploadFile = (
  brokerSubmissionId,
  file,
  attach_to_ticket,
  meta_data,
  token,
  onProgress,
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("attach_to_ticket", attach_to_ticket);
  formData.append("meta_data", meta_data);

  const config = {
    headers: {
      Authorization: "Token " + token,
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total,
      );
      if (onProgress) onProgress(percentCompleted);
    },
  };

  const url = `${SUBMISSIONS_API}${brokerSubmissionId}${UPLOAD}`;

  return axios
    .post(url, formData, config)
    .then((response) => {
      console.log("RESPONSE: ", response);
      return response.data;
    })
    .catch((error) => {
      console.log("Error: ", error);
      throw new Error(error.message);
    })
    .finally(() => {
      console.log("Upload finished");
    });
};

export default uploadFile;

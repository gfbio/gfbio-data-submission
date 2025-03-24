import axios from "axios";
import { CLOUD_UPLOAD, SUBMISSIONS_API, UPLOAD_PATCH } from "../settings.jsx";
import getToken from "./utils/getToken.jsx"; // Adjust import based on your setup

const patchSubmissionCloudUpload = (brokerSubmissionId, fileKey, data) => {
    const config = {
        headers: {
            Authorization: `Token ${getToken()}`,
        },
    };
    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${CLOUD_UPLOAD}${UPLOAD_PATCH}${fileKey}/`;

    return axios.patch(url, data, config)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error setting metadata flag:", error);
            throw new Error(error.message);
        })
        .finally(() => {
        });
};

export default patchSubmissionCloudUpload;

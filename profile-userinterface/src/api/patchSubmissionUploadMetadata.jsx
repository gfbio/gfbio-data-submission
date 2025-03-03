import axios from "axios";
import {SUBMISSIONS_API, UPLOAD, UPLOAD_PATCH} from "../settings.jsx";
import getToken from "./utils/getToken.jsx"; // Adjust import based on your setup

const patchSubmissionUpload = (brokerSubmissionId, fileKey, data) => {
    const config = {
        headers: {
            Authorization: `Token ${getToken()}`,
        },
    };
    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${UPLOAD}${UPLOAD_PATCH}${fileKey}/`;

    return axios.patch(url, data, config)
        .then(response => {
            console.log("RESPONSE: ", response);
            return response.data;
        })
        .catch(error => {
            console.error("Error setting metadata flag:", error);
            throw new Error(error.message);
        })
        .finally(() => {
            console.log("Metadata flag update request finished");
        });
};

export default patchSubmissionUpload;

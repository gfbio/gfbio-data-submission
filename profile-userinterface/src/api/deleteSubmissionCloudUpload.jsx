import axios from "axios";
import { CLOUD_UPLOAD, SUBMISSIONS_API } from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const deleteSubmissionCloudUpload = (brokerSubmissionId, fileKey) => {
    const config = {
        headers: {
            Authorization: `Token ${getToken()}`,
        },
    };

    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${CLOUD_UPLOAD}${fileKey}`;

    return axios
        .delete(url, config)
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error("Error: ", error);
            throw new Error(error.message);
        })
        .finally(() => {
        });
};

export default deleteSubmissionCloudUpload;

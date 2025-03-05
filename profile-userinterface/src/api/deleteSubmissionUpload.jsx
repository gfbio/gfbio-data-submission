import axios from "axios";
import {SUBMISSIONS_API, UPLOAD} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const deleteSubmissionUpload = (brokerSubmissionId, fileKey) => {
    const config = {
        headers: {
            Authorization: `Token ${getToken()}`,
        },
    };

    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${UPLOAD}${fileKey}`;

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

export default deleteSubmissionUpload;

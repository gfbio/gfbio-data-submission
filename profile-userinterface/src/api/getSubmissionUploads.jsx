import axios from "axios";
import {SUBMISSIONS_API, UPLOADS} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const getSubmissionUploads = (brokerSubmissionId) => {
    const config = {
        headers: {
            Authorization: `Token ${getToken()}`,
        },
    };

    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${UPLOADS}`;

    return axios
        .get(url, config)
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

export default getSubmissionUploads;

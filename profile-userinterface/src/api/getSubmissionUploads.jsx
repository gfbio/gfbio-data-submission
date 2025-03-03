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
            console.log("RESPONSE: ", response);
            return response.data;
        })
        .catch((error) => {
            console.log("Error: ", error);
            throw new Error(error.message);
        })
        .finally(() => {
            console.log("Fetch finished");
        });
};

export default getSubmissionUploads;

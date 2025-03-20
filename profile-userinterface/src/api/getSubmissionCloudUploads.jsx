import axios from "axios";
import { CLOUD_UPLOADS, SUBMISSIONS_API } from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const getSubmissionCloudUploads = (brokerSubmissionId) => {
    const config = {
        headers: {
            Authorization: `Token ${getToken()}`,
        },
    };

    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${CLOUD_UPLOADS}`;

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

export default getSubmissionCloudUploads;

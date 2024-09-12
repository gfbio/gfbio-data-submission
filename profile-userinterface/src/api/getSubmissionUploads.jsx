import axios from "axios";
import { SUBMISSIONS_API, UPLOADS } from "../settings.jsx";

const getSubmissionUploads = (brokerSubmissionId) => {
    let token = "";
    if (window.props !== undefined) {
        token = window.props.token || "no-token-found";
    }
    const config = {
        headers: {
            Authorization: `Token ${token}`,
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

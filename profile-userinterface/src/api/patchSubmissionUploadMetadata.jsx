import axios from "axios";
import { SUBMISSIONS_API, UPLOAD, UPLOAD_PATCH } from "../settings.jsx"; // Adjust import based on your setup

const setMetaDataFlag = (brokerSubmissionId, fileKey, meta_data) => {

    let token = "";
    if (window.props !== undefined) {
        token = window.props.token || "no-token-found";
    }
    const config = {
        headers: {
            Authorization: `Token ${token}`,
        },
    };

    // Prepare form data
    let formData = new FormData();
    formData.append("meta_data", meta_data);

    // Construct the URL
    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${UPLOAD}${UPLOAD_PATCH}${fileKey}/`;

    // Make the PATCH request
    return axios.patch(url, formData, config)
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

export default setMetaDataFlag;
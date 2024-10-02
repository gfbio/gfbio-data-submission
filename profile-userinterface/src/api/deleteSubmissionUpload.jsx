import axios from "axios";
import { SUBMISSIONS_API, UPLOAD } from "../settings.jsx";

const deleteSubmissionUpload = (brokerSubmissionId, fileKey) => {
    let token = "";
    if (window.props !== undefined) {
        token = window.props.token || "no-token-found";
    }
    const config = {
        headers: {
            Authorization: `Token ${token}`,
        },
    };

    const url = `${SUBMISSIONS_API}${brokerSubmissionId}${UPLOAD}${fileKey}`;

    return axios
        .delete(url, config)
        .then((response) => {
            console.log("RESPONSE: ", response);
            return response.data;
        })
        .catch((error) => {
            console.log("Error: ", error);
            throw new Error(error.message);
        })
        .finally(() => {
            console.log("Delete request finished");
        });
};

export default deleteSubmissionUpload;
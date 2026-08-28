import axios from "axios";
import getToken from "./utils/getToken.jsx";

const postSubmissionState = async (submissionData, newState) => {
    let result = {};

    const url = `/api/curator/submissions/${submissionData.broker_submission_id}/state/`;
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
            "Content-Type": "application/json",
        },
    };
    await axios.post(url, { state: newState }, config)
        .then((response) => {
            result = response.data;
            submissionData.status = newState;
        })
        .catch((error) => {
            console.error("Error: ", error);
            throw error;
        })
    return result;
};

export default postSubmissionState

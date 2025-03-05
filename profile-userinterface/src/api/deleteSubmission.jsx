import axios from "axios";
import {SUBMISSIONS_API} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const deleteSubmission = async (broker_submission_id) => {
    let result = {};

    const url = SUBMISSIONS_API + broker_submission_id + "/";
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
            "Content-Type": "application/json",
        },
    };

    await axios
        .delete(url, config)
        .then((response) => {
            result = response.data;
        })
        .catch((error) => {
            console.error("Error: ", error);
        })
        .finally(() => {
        });

    return result;
};

export default deleteSubmission;

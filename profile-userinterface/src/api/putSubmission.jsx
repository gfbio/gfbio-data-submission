import axios from "axios";
import {SUBMISSIONS_API} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

export default async function putSubmission(
    broker_submission_id,
    target,
    embargo,
    data
) {
    let result = {};
    const requestData = {
        broker_submission_id: broker_submission_id,
        target: target,
        embargo: embargo,
        data: {
            requirements: data,
        },
    };

    const url = SUBMISSIONS_API + broker_submission_id + "/";
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
            "Content-Type": "application/json",
        },
    };
    await axios
        .put(url, requestData, config)
        .then((reponse) => {
            result = reponse.data;
        })
        .catch((error) => {
            console.error("Error: ", error);
        })
        .finally(() => {
        });
    return result;
}

import axios from "axios";
import { SUBMISSIONS_API } from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

export default async function putSubmission(
    broker_submission_id,
    target,
    embargo,
    data
) {
    let result = {};

    let comment = data.comment || "";
    delete data.comment;

    const requestData = {
        broker_submission_id: broker_submission_id,
        target: target,
        embargo: embargo,
        ...(data.download_url && { download_url: data.download_url }),
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

    result["comment"] =  comment;
    return result;
}

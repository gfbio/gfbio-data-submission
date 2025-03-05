import axios from "axios";
import {SUBMISSIONS_API} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

// TODO: work in progress.
const postSubmission = async (target, embargo, data) => {
    let result = {};
    const requestData = {
        target: target,
        embargo: embargo,
        data: {
            requirements: data,
        },
    };

    // TODO: this url works when build and copied to django, when proper token is provided
    //  everything works, currently the validation fails because details like target are missing
    //  no cross origin errors
    const url = SUBMISSIONS_API;
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
            "Content-Type": "application/json",
        },
    };
    await axios
        .post(url, requestData, config)
        .then((reponse) => {
            result = reponse.data;
        })
        .catch((error) => {
            console.error("Error: ", error);
            // setError(error);
        })
        .finally(() => {
        });
    return result;
};

export default postSubmission;

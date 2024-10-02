import axios from "axios";
import {SUBMISSIONS_API} from "../settings.jsx";

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

    // TODO: local testing, remove, add global testing solution
    // let token = '66b66251e245103c249141d00df43d163cdebb80';
    let token = "";
    if (window.props !== undefined) {
        token = window.props.token || "no-token-found";
    }
    // TODO: this url works when build and copied to django, when proper token is provided
    //  everything works, currently the validation fails because details like target are missing
    //  no cross origin errors
    const url = SUBMISSIONS_API;
    const config = {
        headers: {
            Authorization: "Token " + token,
            "Content-Type": "application/json",
        },
    };
    await axios
        .post(url, requestData, config)
        .then((reponse) => {
            console.log("RESPONSE: ", reponse);
            result = reponse.data;
        })
        .catch((error) => {
            console.log("Error: ", error);
            // setError(error);
        })
        .finally(() => {
            console.log("finally .....");
        });
    return result;
};

export default postSubmission;

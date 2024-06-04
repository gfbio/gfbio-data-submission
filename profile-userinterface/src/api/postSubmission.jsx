import axios from "axios";
import {SUBMISSIONS_API} from "../settings.jsx";

const delay = ms => new Promise(res => setTimeout(res, ms));

// TODO: work in progress.
const postSubmission = async (token, target, data) => {
    let result = {}
    const requestData = {
        target: target,
        data: {
            requirements: data,
        },
    }

    // TODO: remove, just for testing
    await delay(2000);
    console.log("Waited 2s");

    // TODO: this url works when build and copied to django, when proper token is provided
    //  everything works, currently the validation fails because details like target are missing
    //  no cross origin errors
    const url = SUBMISSIONS_API;
    const config = {
        headers: {
            'Authorization': 'Token ' + token,
            'Content-Type': 'application/json',
        },
    };
    await axios
        .post(url, requestData, config)
        .then((reponse) => {
                console.log('RESPONSE: ', reponse);
                // setData(reponse.data);
            }
        )
        .catch((error) => {
                // setError(error);
                console.log('Error: ', error);
            }
        )
        .finally(() => {
                // setLoading(false);
                console.log('finally .....');
                // setProcessing(false)
            }
        )
    return result;
};

export default postSubmission;

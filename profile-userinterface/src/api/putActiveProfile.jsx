import axios from "axios";
import {PROFILE_URL, SUBMISSIONS_API} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";


export default async function putActiveProfile(profilId) {
    let result = {};
    const url = `${PROFILE_URL}${profilId}/select/`;
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
            "Content-Type": "application/json",
        },
    };
    await axios
        .put(url, {}, config)
        .then((reponse) => {
            console.log(" putActiveProfile RESPONSE: ", reponse);
            result = reponse.data;
        })
        .catch((error) => {
            console.error("Error: ", error);
        })
        .finally(() => {
            console.log("putActiveProfile complete");
        });
    return result;
}

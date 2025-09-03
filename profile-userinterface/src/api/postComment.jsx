import axios from "axios";
import {JIRA_COMMENT, SUBMISSIONS_API} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const postComment = async (broker_submission_id, commentText) => {
    let result = {};

    const url = SUBMISSIONS_API + broker_submission_id + JIRA_COMMENT;
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
            "Content-Type": "multipart/form-data",
        },
    };
    let data = new FormData();
    data.append("comment", commentText);
    await axios.post(url, data, config)
        .then((reponse) => {
            result = reponse.data;
        })
        .catch((error) => {
            console.error("Error: ", error);
        })
        .finally(() => {
        });
    return result;
};

export default postComment

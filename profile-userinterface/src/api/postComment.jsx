import axios from "axios";
import {JIRA_COMMENT, SUBMISSIONS_API} from "../settings.jsx";
import getToken from "./utils/getToken.jsx";

const postComment = async (broker_submission_id, commentText) => {
    const url = SUBMISSIONS_API + broker_submission_id + JIRA_COMMENT;
    const config = {
        headers: {
            Authorization: "Token " + getToken(),
        },
    };
    const data = new FormData();
    data.append("comment", commentText);
    const response = await axios.post(url, data, config);
    return response.data;
};

export default postComment;

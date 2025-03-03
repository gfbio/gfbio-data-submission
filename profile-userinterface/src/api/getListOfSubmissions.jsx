import axios from "axios";
import {SUBMISSIONS_API} from "../settings";
import getToken from "./utils/getToken.jsx";

/* eslint-disable react-refresh/only-export-components */
const SubmissionStatus = {
    CANCELLED: 'CANCELLED',
};

const getListOfSubmissions = async () => {
    const url = SUBMISSIONS_API;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        });

        const activeSubmissions = response.data.filter(
            submission => submission.status !== SubmissionStatus.CANCELLED
        );

        return activeSubmissions;
    } catch (error) {
        console.error("Error retrieving list of submissions:", error);
    }
    return [];
};

export default getListOfSubmissions;

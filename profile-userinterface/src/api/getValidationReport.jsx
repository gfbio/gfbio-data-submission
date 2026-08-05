import axios from "axios";
import {SUBMISSIONS_API} from "../settings";
import getToken from "./utils/getToken.jsx";

const getValidationReport = async (brokerSubmissionId, reportId) => {
    const url = `${SUBMISSIONS_API}${brokerSubmissionId}/validation-reports/${reportId}/`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error retrieving validation report:", error);
        throw error;
    }
};

export default getValidationReport;

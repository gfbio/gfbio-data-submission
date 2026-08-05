import axios from "axios";
import {SUBMISSIONS_API} from "../settings";
import getToken from "./utils/getToken.jsx";

const getLatestValidationReport = async (brokerSubmissionId) => {
    const url = `${SUBMISSIONS_API}${brokerSubmissionId}/validation-reports/latest/`;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error retrieving latest validation report:", error);
        throw error;
    }
};

export default getLatestValidationReport;

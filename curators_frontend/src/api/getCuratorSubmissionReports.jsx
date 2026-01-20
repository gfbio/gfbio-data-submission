import axios from "axios";
import getToken from "./utils/getToken.jsx";

const getCuratorSubmissionReports = async (brokerSubmissionId) => {
  if (!brokerSubmissionId) {
    return [];
  }
  const url = `/api/curator/submissions/${brokerSubmissionId}/reports/`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving submission reports:", error);
  }
  return [];
};

export default getCuratorSubmissionReports;

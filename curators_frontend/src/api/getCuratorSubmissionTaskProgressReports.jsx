import axios from "axios";
import getToken from "./utils/getToken.jsx";

const getCuratorSubmissionTaskProgressReports = async (brokerSubmissionId) => {
  if (!brokerSubmissionId) {
    return [];
  }
  const url = `/api/curator/submissions/${brokerSubmissionId}/task-progress-reports/`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving task progress reports:", error);
  }
  return [];
};

export default getCuratorSubmissionTaskProgressReports;

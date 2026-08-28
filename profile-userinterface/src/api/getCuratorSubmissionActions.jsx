import axios from "axios";
import getToken from "./utils/getToken.jsx";

const getCuratorSubmissionActions = async (brokerSubmissionId) => {
  if (!brokerSubmissionId) {
    return [];
  }
  const url = `/api/curator/submissions/${brokerSubmissionId}/actions/`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    });
    return response.data.actions || [];
  } catch (error) {
    console.error("Error retrieving actions:", error);
  }
  return [];
};

export default getCuratorSubmissionActions;

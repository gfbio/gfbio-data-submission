import axios from "axios";
import getToken from "./utils/getToken.jsx";

const getCuratorSubmissionDetail = async (brokerSubmissionId) => {
  if (!brokerSubmissionId) {
    return null;
  }
  const url = `/api/curator/submissions/${brokerSubmissionId}/`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving submission detail:", error);
  }
  return null;
};

export default getCuratorSubmissionDetail;

import axios from "axios";
import getToken from "./utils/getToken.jsx";

const getCuratorSubmissionCloudUploads = async (brokerSubmissionId) => {
  if (!brokerSubmissionId) {
    return [];
  }
  const url = `/api/curator/submissions/${brokerSubmissionId}/cloud-uploads/`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving cloud uploads:", error);
  }
  return [];
};

export default getCuratorSubmissionCloudUploads;

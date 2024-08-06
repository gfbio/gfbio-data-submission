import axios from "axios";
import { SUBMISSIONS_API } from "../settings";

const getSingleSubmission = async (brokerageId) => {
  const url = SUBMISSIONS_API;

  let token = "";
  if (window.props !== undefined) {
    token = window.props.token || "no-token-found";
  }
  try {
    const response = await axios.get(url + brokerageId, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving single submission:", error);
  }
  return {};
};

export default getSingleSubmission;

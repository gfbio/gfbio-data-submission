import axios from "axios";
import { SUBMISSIONS_API } from "../settings";

const getListOfSubmissions = async () => {
  const url = SUBMISSIONS_API;

  let token = "";
  if (window.props !== undefined) {
    token = window.props.token || "no-token-found";
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving list of submissions:", error);
    throw error;
  }
};

export default getListOfSubmissions;

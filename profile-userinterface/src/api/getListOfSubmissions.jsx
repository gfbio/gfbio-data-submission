import axios from "axios";
import { SUBMISSIONS_API } from "../settings";

/* eslint-disable react-refresh/only-export-components */
const SubmissionStatus = {
  CANCELLED: 'CANCELLED',
};

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

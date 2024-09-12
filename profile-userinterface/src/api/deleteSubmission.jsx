import axios from "axios";
import { SUBMISSIONS_API } from "../settings.jsx";

const deleteSubmission = async (broker_submission_id) => {
  let result = {};
  let token = "";
  if (window.props !== undefined) {
    token = window.props.token || "no-token-found";
  }

  const url = SUBMISSIONS_API + broker_submission_id + "/";
  const config = {
    headers: {
      Authorization: "Token " + token,
      "Content-Type": "application/json",
    },
  };

  await axios
    .delete(url, config)
    .then((response) => {
      console.log("RESPONSE: ", response);
      result = response.data;
    })
    .catch((error) => {
      console.log("Error: ", error);
    })
    .finally(() => {
      console.log("finally .....");
    });

  return result;
};

export default deleteSubmission;

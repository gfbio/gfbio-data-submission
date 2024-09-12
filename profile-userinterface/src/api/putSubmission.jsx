import axios from "axios";
import { SUBMISSIONS_API } from "../settings.jsx";

export default async function putSubmission(
  broker_submission_id,
  target,
  embargo,
  data
) {
  let result = {};
  const requestData = {
    broker_submission_id: broker_submission_id,
    target: target,
    embargo: embargo,
    data: {
      requirements: data,
    },
  };

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
    .put(url, requestData, config)
    .then((reponse) => {
      console.log("RESPONSE: ", reponse);
      result = reponse.data;
    })
    .catch((error) => {
      console.log("Error: ", error);
    })
    .finally(() => {
      console.log("finally .....");
    });
  return result;
}

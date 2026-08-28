import getToken from "./utils/getToken.jsx";

const runCuratorSubmissionAction = async (brokerSubmissionId, action) => {
  if (!brokerSubmissionId || !action?.key) {
    return {status: "error", error: "Missing action or submission."};
  }

  if (action.responseType === "file") {
    try {
      const response = await fetch(
        `/api/curator/submissions/${brokerSubmissionId}/actions/`,
        {
          method: "POST",
          headers: {
            Authorization: `Token ${getToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({action: action.key}),
        }
      );
      if (!response.ok) {
        return {status: "error", error: "Download failed."};
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${brokerSubmissionId}-${action.key}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
      return {status: "done", message: "Download started."};
    } catch (error) {
      return {status: "error", error: "Download failed."};
    }
  }

  try {
    const response = await fetch(
      `/api/curator/submissions/${brokerSubmissionId}/actions/`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({action: action.key}),
      }
    );
    if (!response.ok) {
      return {status: "error", error: "Action failed."};
    }
    return {status: "done", message: "Action queued."};
  } catch (error) {
    return {status: "error", error: "Action failed."};
  }
};

export default runCuratorSubmissionAction;

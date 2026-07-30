import axios from "axios";
import getToken from "./utils/getToken.jsx";

const buildQuery = ({page, status, target, user, search, ordering}) => {
  const params = new URLSearchParams();
  params.set("page", page);
  if (status?.length) {
    params.set("status", status.join(","));
  }
  if (target?.length) {
    params.set("target", target.join(","));
  }
  if (user) {
    params.set("user", user);
  }
  if (search) {
    params.set("search", search);
  }
  if (ordering) {
    params.set("ordering", ordering);
  }
  return params.toString();
};

const getCuratorSubmissions = async ({
  page = 1,
  status = [],
  target = [],
  user = "",
  search = "",
  ordering = "-modified",
} = {}) => {
  const query = buildQuery({page, status, target, user, search, ordering});
  const url = `/api/curator/submissions/?${query}`;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Token ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving curator submissions:", error);
  }
  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  };
};

export default getCuratorSubmissions;

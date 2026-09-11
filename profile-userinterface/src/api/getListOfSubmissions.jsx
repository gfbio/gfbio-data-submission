import axios from "axios";
import {SUBMISSIONS_API} from "../settings";
import getToken from "./utils/getToken.jsx";

const getListOfSubmissions = async (params={}) => {
    const url = SUBMISSIONS_API;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
            params: params,
        });

        return response.data;
    } catch (error) {
        console.error("Error retrieving list of submissions:", error);
    }
    return [];
};

export default getListOfSubmissions;

import axios from "axios";
import {USER_API} from "../settings";
import getToken from "./utils/getToken.jsx";

const getCurrentUser = async () => {
    const url = USER_API;
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Token ${getToken()}`,
            },
        });

        const user = response.data;

        return user;
    } catch (error) {
        console.error("Error retrieving currently logged-in user:", error);
    }
    return [];
};

export default getCurrentUser;

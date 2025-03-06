import {LOCAL_API_TOKEN} from "../../settings.jsx";

const getToken = () => {
    let token = LOCAL_API_TOKEN || '';
    if (window.props !== undefined) {
        token = window.props.token || 'no-token-found';
    }
    return token;
};

export default getToken;

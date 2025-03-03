import axios from "axios";
import {useEffect, useState} from 'react';
import {LOCAL_API_TOKEN, PROFILE_LIST_URL, PROFILE_URL} from "../settings.jsx";

const useFetchProfileList = () => {
    const [profileListData, setProfileListData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    let token = LOCAL_API_TOKEN;
    // let token = '';
    if (window.props !== undefined) {
        token = window.props.token || 'no-token-found';
    }
    const config = {
        headers: {
            'Authorization': 'Token ' + token,
            'Content-Type': 'application/json',
        },
    };
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch profile data
                const profileListResponse = await axios.get(PROFILE_LIST_URL, config);
                setProfileListData(profileListResponse.data);

                // If we have a brokerSubmissionId, fetch submission data
                // if (brokerSubmissionId !== undefined) {
                //     const submissionResponse = await axios.get(SUBMISSIONS_API + brokerSubmissionId + '/', config);
                //     setSubmissionData(submissionResponse.data);
                //     const filesResponse = await getSubmissionUploads(brokerSubmissionId);
                //     setSubmissionFiles(filesResponse);
                // } else {
                //     // Initialize empty submission data
                //     setSubmissionData({
                //         data: {
                //             requirements: {}
                //         }
                //     });
                //     setSubmissionFiles([]);
                // }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, []); // Only re-run if these change

    return { profileListData, isLoading, error };
};

export default useFetchProfileList;

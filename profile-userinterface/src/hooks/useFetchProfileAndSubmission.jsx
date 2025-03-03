import axios from "axios";
import { useEffect, useState } from 'react';
import getSubmissionUploads from "../api/getSubmissionUploads.jsx";
import {LOCAL_API_TOKEN, PROFILE_URL, SUBMISSIONS_API} from "../settings.jsx";

const useFetchProfileAndSubmission = (profileName, brokerSubmissionId) => {
    const [profileData, setProfileData] = useState(null);
    const [submissionData, setSubmissionData] = useState(null);
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // TODO: local testing, remove, add global testing solution
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
                const profileResponse = await axios.get(PROFILE_URL + profileName, config);
                setProfileData(profileResponse.data);

                // If we have a brokerSubmissionId, fetch submission data
                if (brokerSubmissionId !== undefined) {
                    const submissionResponse = await axios.get(SUBMISSIONS_API + brokerSubmissionId + '/', config);
                    setSubmissionData(submissionResponse.data);
                    const filesResponse = await getSubmissionUploads(brokerSubmissionId);
                    setSubmissionFiles(filesResponse);
                } else {
                    // Initialize empty submission data
                    setSubmissionData({
                        data: {
                            requirements: {}
                        }
                    });
                    setSubmissionFiles([]);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [profileName, brokerSubmissionId]); // Only re-run if these change

    return { profileData, submissionData, submissionFiles, isLoading, error };
};

export default useFetchProfileAndSubmission;

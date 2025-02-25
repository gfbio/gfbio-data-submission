import axios from "axios";
import { useEffect, useState } from 'react';
import { PROFILE_URL, SUBMISSIONS_API } from "../settings.jsx";

const useFetchProfileAndSubmission = (profileName, brokerSubmissionId) => {
    const [profileData, setProfileData] = useState(null);
    const [submissionData, setSubmissionData] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // TODO: local testing, remove, add global testing solution
    // let token = '3ab8c285f9301d519d002d16138ce079a691edfe';
    let token = '';
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
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch profile data
                const profileResponse = await axios.get(PROFILE_URL + profileName, config);
                if (!isMounted) return;
                setProfileData(profileResponse.data);

                // If we have a brokerSubmissionId, fetch submission data
                if (brokerSubmissionId !== undefined) {
                    const submissionResponse = await axios.get(SUBMISSIONS_API + brokerSubmissionId + '/', config);
                    if (!isMounted) return;
                    setSubmissionData(submissionResponse.data);
                } else {
                    // Initialize empty submission data
                    setSubmissionData({
                        data: {
                            requirements: {}
                        }
                    });
                }
            } catch (error) {
                if (!isMounted) return;
                setError(error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [profileName, brokerSubmissionId]); // Only re-run if these change

    return { profileData, submissionData, isLoading, error };
};

export default useFetchProfileAndSubmission;

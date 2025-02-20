import axios from "axios";
import { useEffect, useState } from 'react';
import { PROFILE_URL, SUBMISSIONS_API } from "../settings.jsx";

const useFetchProfileAndSubmission = (profileName, brokerSubmissionId) => {
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error1, setError1] = useState(null);
    const [error2, setError2] = useState(null);

    // TODO: local testing, remove, add global testing solution
    // let token = '3ab8c285f9301d519d002d16138ce079a691edfe';
    let token = '';
    if (window.props !== undefined) {
        token = window.props.token || 'no-token-found';
    }
    if (brokerSubmissionId === undefined){
        localStorage.setItem('submission', JSON.stringify({
            data: {
                requirements: {}
            }
        }));
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
                setData1(profileResponse.data);

                // If we have a brokerSubmissionId, fetch submission data
                if (brokerSubmissionId !== undefined) {
                    const submissionResponse = await axios.get(SUBMISSIONS_API + brokerSubmissionId + '/', config);
                    if (!isMounted) return;
                    localStorage.setItem('submission', JSON.stringify(submissionResponse.data));
                    setData2(submissionResponse.data);
                }
            } catch (error) {
                if (!isMounted) return;
                if (error.config.url.includes(PROFILE_URL)) {
                    setError1(error);
                } else {
                    setError2(error);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            if (brokerSubmissionId === undefined) {
                localStorage.setItem('submission', JSON.stringify({
                    data: {
                        requirements: {}
                    }
                }));
            }
        };
    }, [profileName, brokerSubmissionId]); // Only re-run if these change

    return {data1, data2, isLoading, error1, error2};
};

export default useFetchProfileAndSubmission;

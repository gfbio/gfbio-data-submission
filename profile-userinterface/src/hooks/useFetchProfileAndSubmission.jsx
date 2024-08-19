import {useEffect, useState} from 'react';
import axios from "axios";
import {PROFILE_URL, SUBMISSIONS_API} from "../settings.jsx";

const useFetchProfileAndSubmission = (profileName, brokerSubmissionId) => {
    const [data1, setData1] = useState([]);
    const [data2, setData2] = useState([]);
    const [proceed, setProceed] = useState(false)
    const [isLoading, setLoading] = useState(true);
    const [error1, setError1] = useState(null);
    const [error2, setError2] = useState(null);

    // TODO: local testing, remove, add global testing solution
    // let token = '66b66251e245103c249141d00df43d163cdebb80';
    let token = '';
    if (window.props !== undefined) {
        token = window.props.token || 'no-token-found';
    }
    if (brokerSubmissionId === undefined){
        localStorage.setItem('submission', JSON.stringify({}));
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
            await axios
                .get(PROFILE_URL + profileName, config)
                .then((response) => {
                        setData1(response.data);
                        setProceed(true);
                    }
                )
                .catch((error) => {
                        setError1(error);
                    }
                )
                .finally(() => {
                        setLoading(false);
                    }
                )
        };

        fetchData();

        // Cleanup function
        return () => {
            // Cleanup logic if needed
        };
    }, []);

    useEffect(() => {
        if (proceed && brokerSubmissionId !== undefined) {
            const fetchData = async () => {
                setLoading(true);
                await axios
                    .get(SUBMISSIONS_API + brokerSubmissionId + '/', config)
                    .then((response) => {
                            localStorage.setItem('submission', JSON.stringify(response.data));
                            setData2(response.data);
                        }
                    )
                    .catch((error) => {
                            setError2(error);
                        }
                    )
                    .finally(() => {
                            setLoading(false);
                        }
                    )
            };

            fetchData();
        }
        // Cleanup function
        return () => {
            // Cleanup logic if needed
        };
    }, [proceed]);

    return {data1, data2, isLoading, error1, error2};
};

export default useFetchProfileAndSubmission;

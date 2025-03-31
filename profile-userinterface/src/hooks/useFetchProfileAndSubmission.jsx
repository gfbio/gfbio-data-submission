import axios from "axios";
import { useEffect, useState } from "react";
import getCloudSubmissionUploads from "../api/getSubmissionCloudUploads.jsx";
import { PROFILE_URL, SUBMISSIONS_API, USE_LOCAL_UPLOAD_ONLY } from "../settings.jsx";
import getToken from "../api/utils/getToken.jsx";
import getSubmissionUploads from "../api/getSubmissionUploads.jsx";

const useFetchProfileAndSubmission = (profileName, brokerSubmissionId) => {
    const [profileData, setProfileData] = useState(null);
    const [submissionData, setSubmissionData] = useState(null);
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localSubmissionFiles, setLocalSubmissionFiles] = useState([]);


    const config = {
        headers: {
            "Authorization": "Token " + getToken(),
            "Content-Type": "application/json",
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
                    const submissionResponse = await axios.get(SUBMISSIONS_API + brokerSubmissionId + "/", config);
                    setSubmissionData(submissionResponse.data);
                    if (!USE_LOCAL_UPLOAD_ONLY) {
                        const cloudFilesResponse = await getCloudSubmissionUploads(brokerSubmissionId);
                        setSubmissionFiles(cloudFilesResponse);
                    }

                    const localFilesResponse = await getSubmissionUploads(brokerSubmissionId);
                    setLocalSubmissionFiles(localFilesResponse);
                } else {
                    // Initialize empty submission data
                    setSubmissionData({
                        data: {
                            requirements: {},
                        },
                    });
                    setSubmissionFiles([]);
                    setLocalSubmissionFiles([]);
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [profileName, brokerSubmissionId]); // Only re-run if these change

    return { profileData, submissionData, submissionFiles, localSubmissionFiles, isLoading, error };
};

export default useFetchProfileAndSubmission;

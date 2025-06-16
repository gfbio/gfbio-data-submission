import { useParams } from "react-router-dom";
import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileAndSubmission from "../hooks/useFetchProfileAndSubmission.jsx";
import ProfileForm from "./ProfileForm.jsx";
import { useState } from "react";
import ProfileManagement from "./ProfileManagement.jsx"
import Cookies from 'universal-cookie';
import { DEFAULT_PROFILE_NAME } from "../settings.jsx";

import useFetchProfileList from "../hooks/useFetchProfileList.jsx";
import NavigationMenu from "./NavigationMenu.jsx";

const ProfileWithLoading = withLoading(ProfileForm);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileFormWrapper = () => {

    const brokerSubmissionId = useParams().brokerageId;
    const cookies = new Cookies();
    const profileName = cookies.get("profileName") || DEFAULT_PROFILE_NAME;

    const [activeProfile, setActiveProfile] = useState(profileName);

    // TODO: for "npm run dev"-development cool, cors exception here, means safety
    //  added to local.py settings CORS_URLS_REGEX = r"^/profile/profile/.*$"
    // const {data, isLoading, error} = useFetch(PROFILE_URL+profileName);
    const {
        profileData,
        submissionData,
        submissionFiles,
        isLoading,
        error,
        localSubmissionFiles,
    } = useFetchProfileAndSubmission(activeProfile, brokerSubmissionId);

    const {
        profileListData,
        profileListIsLoading,
        profileListError,
    } = useFetchProfileList();
    
    // TODO: where display errors ? what actions if error ?
    return (
        <>
            <NavigationMenu />

            <ProfileManagement
                activeProfile={activeProfile}
                profileListData={profileListData}
                setActiveProfile={setActiveProfile}
            />

            <div id={"profileFormWrapper"}>
                <ProfileWithErrorHandling
                    profileData={profileData}
                    submissionData={submissionData}
                    submissionFiles={submissionFiles}
                    isLoading={isLoading}
                    profileError={error}
                    submissionError={error}
                    localSubmissionFiles={localSubmissionFiles}
                />
            </div>
        </>
    );
};

export default ProfileFormWrapper;

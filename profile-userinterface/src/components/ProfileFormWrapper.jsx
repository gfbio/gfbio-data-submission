import { useParams } from "react-router-dom";
import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileAndSubmission from "../hooks/useFetchProfileAndSubmission.jsx";
import { DEFAULT_PROFILE_NAME } from "../settings.jsx";
import ProfileForm from "./ProfileForm.jsx";
import { useState } from "react";
import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import Cookies from 'universal-cookie';

import useFetchProfileList from "../hooks/useFetchProfileList.jsx";
import ProfileSelector from "./ProfileSelector.jsx";
import NavigationMenu from "./NavigationMenu.jsx";

const ProfileWithLoading = withLoading(ProfileForm);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileFormWrapper = () => {

    const brokerSubmissionId = useParams().brokerageId;
    const cookies = new Cookies();
cookies.set('myCat', 'Pacman', { path: '/' });
console.log(cookies.get('myCat')); // Pacman
    const profileName = cookies.get("profileName") || DEFAULT_PROFILE_NAME;

    const [activeProfile, setActiveProfile] = useState(profileName);

    const handleProfileChange = (data) => {
        cookies.set("profileName", data, { path: '/', expires: new Date(Date.now() + 365 / 2 * 86400 * 1000) });
        
        modals.closeAll();
        setActiveProfile(data);
    };

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
            <NavigationMenu>
                {
                    profileListData && profileListData.length > 1 &&
                    <div className="nav-link ms-auto change-profile-button-menu" 
                        onClick={() => {
                            modals.open({
                                title: "Submission Profile Selection",
                                size: "xl",
                                centered: true,
                                children: (
                                    <>
                                        <ProfileSelector 
                                            onCancel={modals.closeAll}
                                            onProfileChange={handleProfileChange}
                                            profileListData={profileListData}
                                            activeProfile={activeProfile} />
                                    </>
                                ),
                            });
                        }}
                    >
                        <div className="me-2">
                            <div className="fs-7">
                                Fields displayed according to
                            </div>
                            <div className="fs-7">
                                profile <b>{profileData?.name ?? profileName}</b>
                            </div>
                        </div>
                        <Button className="change-profile-button">
                            Change
                        </Button>
                    </div>
                }
            </NavigationMenu>

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

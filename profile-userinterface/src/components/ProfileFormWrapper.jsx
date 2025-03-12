import {useParams} from "react-router-dom";
import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileAndSubmission from "../hooks/useFetchProfileAndSubmission.jsx";
import {DEFAULT_PROFILE_NAME} from "../settings.jsx";
import ProfileForm from "./ProfileForm.jsx";
import {useState} from "react";
import {modals} from '@mantine/modals';

const ProfileWithLoading = withLoading(ProfileForm);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileFormWrapper = () => {
    const brokerSubmissionId = useParams().brokerageId;
    const profileName = localStorage.getItem('profileName') || DEFAULT_PROFILE_NAME;

    const [activeProfile, setActiveProfile] = useState(profileName);

    const handleProfileChange = (data) => {
        localStorage.setItem("profileName", data);
        modals.closeAll();
        setActiveProfile(data)
    }

    // TODO: for "npm run dev"-development cool, cors exception here, means safety
    //  added to local.py settings CORS_URLS_REGEX = r"^/profile/profile/.*$"
    // const {data, isLoading, error} = useFetch(PROFILE_URL+profileName);
    const {
        profileData,
        submissionData,
        submissionFiles,
        isLoading,
        error
    } = useFetchProfileAndSubmission(activeProfile, brokerSubmissionId);

    // TODO: where display errors ? what actions if error ?
    return (
        <>
            {/* TODO: DASS-2455 (12.03.2025): this button opens a modal with a dialog that allows selecting on of the
                    available system-wide-profile followed by a re-render of the form based on the newly selected
                    profile. This is de-activated for now, but will be used in the near future. */}
            {/*<Button*/}
            {/*    onClick={() => {*/}
            {/*        modals.open({*/}
            {/*            title: "Submission Profile Selection",*/}
            {/*            size: "xl",*/}
            {/*            centered: true,*/}
            {/*            children: (*/}
            {/*                <>*/}
            {/*                    <ProfileSelector onCancel={modals.closeAll} onProfileChange={handleProfileChange}></ProfileSelector>*/}
            {/*                </>*/}
            {/*            ),*/}
            {/*        });*/}
            {/*    }}*/}
            {/*>*/}
            {/*    Change Profile*/}
            {/*</Button>*/}
            {/* -----------------------------------------------------------------------------------------------------*/}

            <div id={"profileFormWrapper"}>
                <ProfileWithErrorHandling
                    profileData={profileData}
                    submissionData={submissionData}
                    submissionFiles={submissionFiles}
                    isLoading={isLoading}
                    profileError={error}
                    submissionError={error}
                />
            </div>
        </>
    );
};

export default ProfileFormWrapper;

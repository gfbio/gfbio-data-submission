import { useParams } from "react-router-dom";
import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileAndSubmission from "../hooks/useFetchProfileAndSubmission.jsx";
import { DEFAULT_PROFILE_NAME } from "../settings.jsx";
import ProfileForm from "./ProfileForm.jsx";

const ProfileWithLoading = withLoading(ProfileForm);
const ProfileWithErrorHandling = withErrorHandling(ProfileWithLoading);

const ProfileFormWrapper = () => {
    const brokerSubmissionId = useParams().brokerageId;
    // TODO: add check and warning if necessary parmaters like token are not available
    // let profileName = 'generic';
    // if (window.props !== undefined) {
    //     profileName = window.props.profile_name || 'generic';
    // }

    // TODO: this is put into localStorage in main.jsx, where it is derived from window.props
    //  in main.jsx profileName is needed to properly configure the react-router-dom BrowserRouter
    const profileName = localStorage.getItem('profileName') || DEFAULT_PROFILE_NAME;

    // TODO: for "npm run dev"-development cool, cors exception here, means safety
    //  added to local.py settings CORS_URLS_REGEX = r"^/profile/profile/.*$"
    // const {data, isLoading, error} = useFetch(PROFILE_URL+profileName);
    const {
        profileData,
        submissionData,
        isLoading,
        error
    } = useFetchProfileAndSubmission(profileName, brokerSubmissionId);

    // TODO: where display errors ? what actions if error ?
    return (
        <div>
            <ProfileWithErrorHandling 
                profileData={profileData} 
                submissionData={submissionData} 
                isLoading={isLoading}
                profileError={error} 
                submissionError={error}
            />
        </div>
    );
};

export default ProfileFormWrapper;

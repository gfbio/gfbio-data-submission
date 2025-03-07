import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileList from "../hooks/useFetchProfileList.jsx";
import ProfileSelectDialog from "./ProfileSelectDialog.jsx";
import PropTypes from "prop-types";

const ProfileSelectDialogWithLoading = withLoading(ProfileSelectDialog);
const ProfileSelectDialogWithErrorHandling = withErrorHandling(ProfileSelectDialogWithLoading);

const ProfileSelector = ({ onProfileChange }) => {
    const {
        profileListData,
        isLoading,
        error,
    } = useFetchProfileList();

    return (
        <>
            <ProfileSelectDialogWithErrorHandling
                onProfileChange={onProfileChange}
                profileListData={profileListData}
            />
        </>
    );
};

ProfileSelector.propTypes = {
    onProfileChange: PropTypes.func.isRequired,
};

export default ProfileSelector;

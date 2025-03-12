import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileList from "../hooks/useFetchProfileList.jsx";
import ProfileSelectDialog from "./ProfileSelectDialog.jsx";
import PropTypes from "prop-types";

const ProfileSelectDialogWithLoading = withLoading(ProfileSelectDialog);
const ProfileSelectDialogWithErrorHandling = withErrorHandling(ProfileSelectDialogWithLoading);

const ProfileSelector = ({ onCancel, onProfileChange }) => {
    const {
        profileListData,
        isLoading,
        error,
    } = useFetchProfileList();

    return (
        <>
            <ProfileSelectDialogWithErrorHandling
                onCancel={onCancel}
                onProfileChange={onProfileChange}
                profileListData={profileListData}
            />
        </>
    );
};

ProfileSelector.propTypes = {
    onProfileChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ProfileSelector;

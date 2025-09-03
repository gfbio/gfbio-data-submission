import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import ProfileSelectDialog from "./ProfileSelectDialog.jsx";
import PropTypes from "prop-types";

const ProfileSelectDialogWithLoading = withLoading(ProfileSelectDialog);
const ProfileSelectDialogWithErrorHandling = withErrorHandling(ProfileSelectDialogWithLoading);

const ProfileSelector = ({ onCancel, onProfileChange, profileListData, activeProfile }) => {
    return (
        <>
            <ProfileSelectDialogWithErrorHandling
                onCancel={onCancel}
                onProfileChange={onProfileChange}
                profileListData={profileListData}
                activeProfile={activeProfile}
            />
        </>
    );
};

ProfileSelector.propTypes = {
    onProfileChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    profileListData: PropTypes.array.isRequired,
    activeProfile: PropTypes.string.isRequired,
};

export default ProfileSelector;

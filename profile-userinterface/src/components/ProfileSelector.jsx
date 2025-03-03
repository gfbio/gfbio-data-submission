import withErrorHandling from "../hocs/withErrorHandling";
import withLoading from "../hocs/withLoading";
import useFetchProfileList from "../hooks/useFetchProfileList.jsx";
import ProfileSelectDialog from "./ProfileSelectDialog.jsx";

const ProfileSelectDialogWithLoading = withLoading(ProfileSelectDialog);
const ProfileSelectDialogWithErrorHandling = withErrorHandling(ProfileSelectDialogWithLoading);

const ProfileSelector = () => {
    console.log("ProfileSelector");
    const {
        profileListData,
        isLoading,
        error
    } = useFetchProfileList();

    console.log("ProfileSelector | data");
    // console.log(profileListData);
    console.log(isLoading);
    console.log(error);


    return (
        <>
            <ProfileSelectDialogWithErrorHandling
                profileListData={profileListData}
            />
        </>
    );
};

ProfileSelector.propTypes = {}

export default ProfileSelector;

import PropTypes from "prop-types";
import { Button } from "@mantine/core";
import { modals } from "@mantine/modals";
import ProfileSelector from "./ProfileSelector.jsx";
import Cookies from 'universal-cookie';
import { DEFAULT_PROFILE_NAME } from "../settings.jsx";

const ProfileManagement = ({profileListData, activeProfile, setActiveProfile}) => {
    const cookies = new Cookies();
    const profileName = cookies.get("profileName") || DEFAULT_PROFILE_NAME;
    setActiveProfile(profileName);

    const handleProfileChange = (data) => {
        cookies.set("profileName", data, { path: '/', expires: new Date(Date.now() + 365 / 2 * 86400 * 1000) });
        
        modals.closeAll();
        setActiveProfile(data);
    };

    return (
        <div className="profile-managment-bar w-100 d-flex justify-content-end">
            {
                profileListData && profileListData.length > 1 && 
                <div className="profile-menu d-flex align-items-baseline" 
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
                    <div>
                        Current profile: <b>{activeProfile}</b>
                    </div>
                    <Button className="change-profile-button ms-2">
                        Change
                    </Button>
                </div>
            }
        </div>
    );
};

ProfileManagement.propTypes = {
    activeProfile: PropTypes.object.isRequired,
    profileList: PropTypes.array.isRequired,
    setActiveProfile: PropTypes.func.isRequired,
};

export default ProfileManagement;
                
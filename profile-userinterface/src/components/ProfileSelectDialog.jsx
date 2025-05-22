import PropTypes from "prop-types";
import {useForm} from "@mantine/form";
import {Button, Group, Select} from "@mantine/core";
import {DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME, PROFILE_SELECTION_FORM_KEY} from "../settings.jsx";
import putActiveProfile from "../api/putActiveProfile.jsx";


const ProfileSelectDialog = ({onCancel, onProfileChange, profileListData, activeProfile}) => {

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-select-form",
    });

    const handleSubmit = (values) => {
        if (values && Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            let profileId = DEFAULT_PROFILE_ID;
            if (values[PROFILE_SELECTION_FORM_KEY] !== null) {
                profileId = values[PROFILE_SELECTION_FORM_KEY];
            }
            onProfileChange(profileId);
            /*
                Instead of creating a private profile, just use the public profiles for now
                putActiveProfile(profileId).then((result) => {
                    onProfileChange(result["name"]);
                }).catch((error) => {
                    console.error(error);
                }).finally(() => {
                });
            */
        } else if (values && !Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            // Confirmed, though profile wasn't changed. Just quit.
            onCancel();
        } else {
            // do nothing
        }
    };

    const prepareSelectOptions = (profileListData) => {
        let result = [];
        if (!Array.isArray(profileListData)) {
            return result;
        }
        result = profileListData.flatMap(obj => {
            if (obj && Object.prototype.hasOwnProperty.call(obj, "name")) {
                return [{"value": "" + obj["name"], "label": obj["name"] 
                    + ((obj["name"] === DEFAULT_PROFILE_NAME) ? " (default)" : "")
                    + ((obj["name"] === activeProfile) ? " - active" : "") }];
            }
            return [];
        });
        return result;
    }

    return (
        <>
            <form
                onSubmit={form.onSubmit(handleSubmit)}
                className="submission-form container"
            >
                <div className="col-md-12 pt-2">
                    Fields are currently displayed according to profile <b>{activeProfile}</b>
                    <div className="">
                        <Select
                            // label="Submission Profile Selection"
                            description="Select a new default Profile for your account, or keep the currently used Profile. "
                            placeholder="Select a Profile."
                            data={prepareSelectOptions(profileListData)}
                            // allowDeselect
                            key={form.key(PROFILE_SELECTION_FORM_KEY)}
                            {...form.getInputProps(PROFILE_SELECTION_FORM_KEY)}
                            mt="md"
                            defaultValue={activeProfile}
                        />
                        <Group mt="md" className="" justify="center">
                            <Button className="red-button button-inverted" type="button" onClick={onCancel}>
                                <i className=""></i>Cancel
                            </Button>
                            <Button className="blue-button" type="submit">
                                <i className=""></i>Confirm Selection
                            </Button>
                        </Group>
                    </div>
                </div>
            </form>
        </>
    );
};

ProfileSelectDialog.propTypes = {
    profileListData: PropTypes.array.isRequired,
    onProfileChange: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ProfileSelectDialog;

import PropTypes from "prop-types";
import {useForm} from "@mantine/form";
import {Button, Group, Select} from "@mantine/core";
import {DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME, PROFILE_SELECTION_FORM_KEY} from "../settings.jsx";
import putActiveProfile from "../api/putActiveProfile.jsx";

const ProfileSelectDialog = ({onProfileChange, profileListData}) => {

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
    });

    const handleSubmit = (values) => {
        if (values && Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            let profileId = DEFAULT_PROFILE_ID;
            if (values[PROFILE_SELECTION_FORM_KEY] !== null) {
                profileId = values[PROFILE_SELECTION_FORM_KEY];
            }
            putActiveProfile(profileId).then((result) => {
                onProfileChange(result["name"]);
            }).catch((error) => {
                console.error(error);
            }).finally(() => {
            });
        } else if (values && !Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            // do nothing
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
            if (obj && Object.prototype.hasOwnProperty.call(obj, "name") &&
                Object.prototype.hasOwnProperty.call(obj, "id")) {
                if (obj["name"] === DEFAULT_PROFILE_NAME) {
                    return [{"value": "" + obj["id"], "label": obj["name"] + " (default)"}];
                }
                return [{"value": "" + obj["id"], "label": obj["name"]}];
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
                <div className="col-md-12">
                    <div className="">
                        <Select
                            label="Submission Profile Selection"
                            description="Select a new default Profile for your account,
                            or keep the currently used Profile. Reset to default by un-selecting the current selection."
                            placeholder="Select a Profile. Or reset to default by pressing Confirm."
                            data={prepareSelectOptions(profileListData)}
                            allowDeselect
                            key={form.key(PROFILE_SELECTION_FORM_KEY)}
                            {...form.getInputProps(PROFILE_SELECTION_FORM_KEY)}
                            mt="md"
                        />
                        <Group mt="md" className="">
                            <Button className="submission-button" type="submit">
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
};

export default ProfileSelectDialog;

import PropTypes from "prop-types";
import {useForm} from "@mantine/form";

import {Button, Group, Select} from "@mantine/core";
import {PROFILE_SELECTION_FORM_KEY} from "../settings.jsx";
import putActiveProfile from "../api/putActiveProfile.jsx";

const ProfileSelectDialog = ({profileListData}) => {

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
    });

    const handleSubmit = (values) => {
        if (values && Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            if (values[PROFILE_SELECTION_FORM_KEY] === null) {
                // reset to default DEFAULT_PROFILE_NAME
                console.log("\tPROFILE_SELECTION_FORM_KEY is null .....");
                // TODO: get profile id per name or set via name in backend
                //  better reset for user
                // putActiveProfile();
            } else {
                // set active user profile to this one
                console.log("\tPROFILE_SELECTION_FORM_KEY not null: ", values[PROFILE_SELECTION_FORM_KEY]);
                putActiveProfile(values[PROFILE_SELECTION_FORM_KEY]).then((result) => {
                    console.log('....resuklt');
                    console.log(result);
                }).catch((error) => {
                    console.error(error);
                }).finally(() => {
                });
            }
        } else if (values && !Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            // do nothing
            console.log("fORM_KEY NOT present in values; ", values);
        } else {
            // do nothing
            console.log('....ELSE')
        }
    };

    const prepareSelectOptions = (profileListData) => {
        if (!Array.isArray(profileListData)) {
            return [];
        }
        return profileListData.flatMap(obj => {
            if (obj && Object.prototype.hasOwnProperty.call(obj, "name") &&
                Object.prototype.hasOwnProperty.call(obj, "id")) {
                return [{"value": "" + obj["id"], "label": obj["name"]}];
            }
            return [];
        });
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
                            placeholder="Select a Profile or return to default by un-selecting the current selection."
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
};

export default ProfileSelectDialog;

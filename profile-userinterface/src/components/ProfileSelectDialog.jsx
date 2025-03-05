import PropTypes from "prop-types";
import {useForm} from "@mantine/form";
import {useState} from "react";
import {Button, Group, Select} from "@mantine/core";
import {DEFAULT_PROFILE_ID, DEFAULT_PROFILE_NAME, PROFILE_SELECTION_FORM_KEY} from "../settings.jsx";
import putActiveProfile from "../api/putActiveProfile.jsx";

const ProfileSelectDialog = ({profileListData}) => {

    const [activeProfile, setActiveProfile] = useState("");
    const profileName = localStorage.getItem('profileName') || DEFAULT_PROFILE_NAME;
    console.log('ProfileSelectDialog | profileName from storage', profileName);

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
    });

    const handleSubmit = (values) => {
        console.log("VALUES: ", values);
        if (values && Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            if (values[PROFILE_SELECTION_FORM_KEY] === null) {
                // reset to default DEFAULT_PROFILE_NAME
                // console.log("\tPROFILE_SELECTION_FORM_KEY is null .....");
                // TODO: get profile id per name or set via name in backend
                //  better reset for user
                // putActiveProfile();
                // setActiveProfile(DEFAULT_PROFILE_NAME);

                // TODO: set profile to use/render back to default on globval level
                //  if user selects profile, then set profile also globally


                // TODO: below is q&dirty
                putActiveProfile(DEFAULT_PROFILE_ID).then((result) => {
                    // setActiveProfile(result["parent_name"]);
                    localStorage.setItem("profileName", result["parent_name"]);
                }).catch((error) => {
                    console.error(error);
                }).finally(() => {
                });
            } else {
                // console.log(profileListData)
                // let result = profileListData.filter(obj => {
                //     return "" + obj.id === "" + values[PROFILE_SELECTION_FORM_KEY]
                // })
                // // console.log('result', result);
                // let res = result[0]["name"] || DEFAULT_PROFILE_NAME
                // localStorage.setItem("profileName", res);
                // set active user profile to this one
                putActiveProfile(values[PROFILE_SELECTION_FORM_KEY]).then((result) => {
                    // setActiveProfile(result["parent_name"]);
                    localStorage.setItem("profileName", result["parent_name"]);
                }).catch((error) => {
                    console.error(error);
                }).finally(() => {
                });
            }
        } else if (values && !Object.prototype.hasOwnProperty.call(values, PROFILE_SELECTION_FORM_KEY)) {
            // do nothing
            // setActiveProfile(DEFAULT_PROFILE_NAME);
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
                return [{"value": "" + obj["id"], "label": obj["name"]}];
            }
            return [];
        });
        return result;
    }

    const getActiveProfileText = (activeProfile) => {
        if (activeProfile === "") {
            return (<></>);
        }
        return (
            <p>{activeProfile}</p>
        )
    };

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
                            {/*{getActiveProfileText(activeProfile)}*/}
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

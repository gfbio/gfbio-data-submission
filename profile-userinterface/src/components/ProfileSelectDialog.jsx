import PropTypes from "prop-types";
import {useForm} from "@mantine/form";

import {Button, Group, Select} from "@mantine/core";

const ProfileSelectDialog = ({profileListData}) => {

    console.log("ProfileSelectDialog | data");
    console.log(profileListData);

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
        // initialValues: buildInitialValues(),
        // validateInputOnBlur: true,
        // validate: (values) => {
        //     if (!profileData?.form_fields) return {};
        //
        //     let field_types = profileData.form_fields.map(
        //         (form_field) => form_field.field.field_type.type
        //     );
        //     const validations = {}
        //     validateTextFields(values, profileData, validations);
        //     if (field_types.includes("data-url-field")) {
        //         validateDataUrlField(values, profileData, validations);
        //     }
        //     return validations
        // },
    });

    const handleSubmit = (values) => {
        console.log("ProfileSelectDialog | handleSubmit | values");
        console.log(values);
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
                            key={form.key("profile-selection")}
                            {...form.getInputProps("profile-selection")}
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

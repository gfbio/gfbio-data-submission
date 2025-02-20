import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import createUploadFileChannel from "../api/createUploadFileChannel.jsx";
import postSubmission from "../api/postSubmission.jsx";
import putSubmission from "../api/putSubmission.jsx";
import FormField from "../field_mapping/FormField.jsx";
import { ROUTER_BASE_URL } from "../settings.jsx";
import validateDataUrlField from "../utils/DataUrlValidation.jsx";
import validateTextFields from "../utils/TextValidation.jsx";
import LeaveFormDialog from "./LeaveFormDialog.jsx";

const ProfileForm = (props) => {
    const {
        profileData,
    } = props;
    const [isProcessing, setProcessing] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);
    const [metadataIndex, setMetadataIndex] = useState(-1);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const navigate = useNavigate();
    const submission = JSON.parse(localStorage.getItem("submission"));

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
        validateInputOnBlur: true,
        initialValues: {
            files: [],
        },
        validate: (values) => {
            let field_types = profileData.form_fields.map(
                (form_field) => form_field.field.field_type.type
            );
            var validations = {}
            validateTextFields(values, profileData, validations);
            if (field_types.includes("data-url-field")) {
                validateDataUrlField(values, profileData, validations);
            }
            return validations
        },
    });

    // Reset form dirty state after initial field loading
    useEffect(() => {
        if (!submission) return; // Don't reset if submission isn't loaded yet

        // Wait for next tick to ensure all fields have loaded
        const timer = setTimeout(() => {
            form.resetDirty();
        }, 100);

        return () => clearTimeout(timer);
    }, []); // Only run once after initial mount

    // Block navigation when form is dirty
    useBlocker(
        ({ currentLocation, nextLocation }) => {
            if (form.isDirty() && !isProcessing && currentLocation.pathname !== nextLocation.pathname) {
                setShowLeaveDialog(true);
                setPendingNavigation(nextLocation.pathname);
                return true;
            }
            return false;
        },
        form.isDirty()
    );

    // Handle beforeunload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (form.isDirty()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [form]);

    const handleLeaveCancel = () => {
        setShowLeaveDialog(false);
        setPendingNavigation(null);
    };

    const handleLeaveSave = async () => {
        handleSubmit(form.getValues());
        setShowLeaveDialog(false);
    };

    const handleLeaveDiscard = () => {
        setShowLeaveDialog(false);
        form.reset();
        if (pendingNavigation) {
            navigate(pendingNavigation);
        }
    };

    const handleFilesChange = (uploadedFiles, isValid, metaIndex) => {
        form.setFieldValue("files", uploadedFiles);
        setFiles(uploadedFiles);
        setUploadLimitExceeded(isValid);
        setMetadataIndex(metaIndex);
    };

    const handleFileUpload = async (file, brokerSubmissionId, isMetadata) => {
        const attach_to_ticket = false;
        const meta_data = isMetadata;
        let token = "";
        if (window.props !== undefined) {
            token = window.props.token || "no-token-found";
        }
        try {
            await createUploadFileChannel(
                brokerSubmissionId,
                file,
                attach_to_ticket,
                meta_data,
                token,
                (percentCompleted) => {
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            );
            console.log("Upload complete");
        } catch (error) {
            console.error("Upload error: ", error);
        }
    };

    const handleSubmit = (values) => {
        if (!form.isValid || uploadLimitExceeded) {
            return;
        }
        setProcessing(true);
        // TODO: fixed token value for local testing only
        if (submission?.broker_submission_id) {
            console.log("values: ", values);
            putSubmission(
                submission.broker_submission_id,
                profileData.target,
                localStorage.getItem("embargo"),
                values
            )
            .then((result) => {
                if (result?.broker_submission_id) {
                    const brokerSubmissionId = result.broker_submission_id;
                    const fileUploadPromises = files.map((file, index) =>
                        handleFileUpload(file, brokerSubmissionId, index === metadataIndex),
                    );
                    return Promise.all(fileUploadPromises).then(() => {
                        setShowLeaveDialog(false); // Close dialog after successful submission
                        navigate(pendingNavigation || ROUTER_BASE_URL);
                    });
                } else {
                    console.error(
                        "broker_submission_id is missing in the response data.",
                    );
                    // Throw an error to trigger the catch block
                    throw new Error(
                        "broker_submission_id is missing in the response data.",
                    );
                }
            })
            .catch((error) => {
                console.error("Submission error: ", error);
            })
            .finally(async () => {
                await new Promise(r => setTimeout(r, 2000)); //prevent submit-button from getting available before page-redirect
                setProcessing(false);
            });
        } else {
            postSubmission(profileData.target, localStorage.getItem("embargo"), values)
                .then((result) => {
                    if (result?.broker_submission_id) {
                        const brokerSubmissionId = result.broker_submission_id;
                        const fileUploadPromises = files.map((file, index) =>
                            handleFileUpload(file, brokerSubmissionId, index === metadataIndex),
                        );
                        return Promise.all(fileUploadPromises).then(() => {
                            setShowLeaveDialog(false); // Close dialog after successful submission
                            navigate(pendingNavigation || ROUTER_BASE_URL);
                        });
                    } else {
                        console.error(
                            "broker_submission_id is missing in the response data.",
                        );
                        // Throw an error to trigger the catch block
                        throw new Error(
                            "broker_submission_id is missing in the response data.",
                        );
                    }
                })
                .catch((error) => {
                    console.error("Submission error: ", error);
                })
                .finally(async () => {
                    await new Promise(r => setTimeout(r, 2000)); //prevent submit-button from getting available before page-redirect
                    setProcessing(false);
                });
        }
    };

    const createSubmitButton = () => {
        if (isProcessing) {
            return (
                <Button className="submission-button disabled" type="submit" disabled>
                    <i className="fa fa-gear me-3"></i> Processing...
                </Button>
            );
        }
        else if (submission?.broker_submission_id) {
            return (
                <Button className="submission-button" type="submit">
                    <i className="fa fa-forward me-3"></i> Update Submission
                </Button>
            );
        } else {
            return (
                <Button className="submission-button" type="submit">
                    <i className="fa fa-play me-3"></i> Create Submission
                </Button>
            );
        }
    };

    return (
        <>
            <LeaveFormDialog 
                isOpen={showLeaveDialog}
                onCancel={handleLeaveCancel}
                onSave={handleLeaveSave}
                onDiscard={handleLeaveDiscard}
            />
            <form
                onSubmit={form.onSubmit(handleSubmit)}
                className="submission-form container"
            >
                <div className="row">
                    <div className="col-md-9 main-col">
                        {profileData.form_fields
                            .filter((form_field) => form_field.field.position === "main")
                            .map((form_field, index) => (
                                <FormField
                                    key={index}
                                    formField={form_field}
                                    form={form}
                                    onFilesChange={handleFilesChange}
                                ></FormField>
                            ))
                        }
                    </div>
                    <div className="col-md-3 side-col">
                        {profileData.form_fields
                            .filter((form_field) => form_field.field.position === "sidebar")
                            .map((form_field, index) => (
                                <FormField
                                    key={index}
                                    formField={form_field}
                                    form={form}
                                    onFilesChange={handleFilesChange}
                                ></FormField>
                            ))
                        }
                    </div>
                </div>
                <div className="row">
                    <Group mt="md" className="mt-5 col-md-9">
                        {createSubmitButton()}
                    </Group>
                </div>
            </form>
        </>
    );
};

ProfileForm.propTypes = {
    profileData: PropTypes.object.isRequired,
};

export default ProfileForm;

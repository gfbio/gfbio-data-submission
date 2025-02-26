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

const ProfileForm = ({ profileData, submissionData, submissionFiles }) => {
    const [isProcessing, setProcessing] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);
    const [metadataIndex, setMetadataIndex] = useState(-1);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const navigate = useNavigate();

    // Initialize form with values from profile and submission data
    const buildInitialValues = () => {
        const defaultEmbargoDate = new Date();
        defaultEmbargoDate.setFullYear(defaultEmbargoDate.getFullYear() + 1);
        
        // Start with minimal required values
        const values = { 
            files: submissionFiles || [],
            embargo: submissionData?.embargo || defaultEmbargoDate.toISOString().split('T')[0],
            license: submissionData?.license || 'CC BY 4.0'
        };
        console.log("initial values: ", values);

        if (!profileData?.form_fields) return values;
        
        profileData.form_fields.forEach(field => {
            const fieldId = field.field.field_id;
            const fieldValue = submissionData?.data?.requirements[fieldId];
            
            // Only set a value if we have a submission value
            if (fieldValue !== undefined) {
                // Use the value from submission data
                values[fieldId] = fieldValue;
            }
            // Otherwise, don't set any value (undefined)
        });

        return values;
    };

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
        initialValues: buildInitialValues(),
        validateInputOnBlur: true,
        validate: (values) => {
            if (!profileData?.form_fields) return {};
            
            let field_types = profileData.form_fields.map(
                (form_field) => form_field.field.field_type.type
            );
            const validations = {}
            validateTextFields(values, profileData, validations);
            if (field_types.includes("data-url-field")) {
                validateDataUrlField(values, profileData, validations);
            }
            return validations
        },
    });

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

        // Extract embargo_date before filtering other values
        const embargoDate = values.embargo;

        // Filter out empty values and embargo_date
        const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
            // Skip embargo date and files as they're handled separately
            if (key === 'embargo' || key === 'files') return acc;
            
            // Keep arrays even if empty
            if (Array.isArray(value)) {
                acc[key] = value;
                return acc;
            }
            // Only include non-empty string values
            if (value !== '' && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});

        // TODO: fixed token value for local testing only
        if (submissionData?.broker_submission_id) {
            console.log("values: ", filteredValues);
            putSubmission(
                submissionData.broker_submission_id,
                profileData.target,
                embargoDate,
                filteredValues
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
            postSubmission(profileData.target, embargoDate, filteredValues)
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
        else if (submissionData?.broker_submission_id) {
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
                                    brokerSubmissionId={submissionData?.broker_submission_id}
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
                                    brokerSubmissionId={submissionData?.broker_submission_id}
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
    submissionData: PropTypes.object,
    submissionFiles: PropTypes.array,
};

export default ProfileForm;

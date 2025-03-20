import { Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import createUploadFileChannel from "../api/createUploadFileChannel.jsx";
import postSubmission from "../api/postSubmission.jsx";
import putSubmission from "../api/putSubmission.jsx";
import { uploadFileToS3 } from "../api/s3UploadSubmission.jsx";
import getToken from "../api/utils/getToken.jsx";
import FormField from "../field_mapping/FormField.jsx";
import { ROUTER_BASE_URL } from "../settings.jsx";
import ErrorBox from "./ErrorBox.jsx";
import LeaveFormDialog from "./LeaveFormDialog.jsx";

const ProfileForm = ({ profileData, submissionData, submissionFiles }) => {
    const [isProcessing, setProcessing] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploadLimitExceeded, setUploadLimitExceeded] = useState(false);
    const [metadataIndex, setMetadataIndex] = useState(-1);
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [errorList, setErrorList] = useState([]);
    const navigate = useNavigate();

    // Initialize form with values from profile and submission data
    const buildInitialValues = () => {
        const defaultEmbargoDate = new Date();
        defaultEmbargoDate.setFullYear(defaultEmbargoDate.getFullYear() + 1);

        // Start with minimal required values
        const values = {
            files: submissionFiles || [],
            embargo: submissionData?.embargo || defaultEmbargoDate.toISOString().split("T")[0],
            download_url: submissionData?.download_url || "",
        };

        if (!profileData?.form_fields) return values;

        profileData.form_fields.forEach(field => {
            const fieldId = field.field.field_id;
            const fieldValue = submissionData?.data?.requirements[fieldId];

            // skip embargo date and download_url
            if (fieldId === "embargo" || fieldId === "download_url") return;

            // set default value if field is not set
            if (fieldValue === undefined && field.default !== "") {
                values[fieldId] = field.default;
            }

            // Only set a value if we have a submission value
            if (fieldValue !== undefined) {
                // Use the value from submission data
                values[fieldId] = fieldValue;
            }
            // Otherwise, don't set any value (undefined)
        });

        return values;
    };

    const registeredValidations = [];

    const form = useForm({
        mode: "uncontrolled",
        name: "profile-form",
        initialValues: buildInitialValues(),
        validateInputOnBlur: false,
        validate: (values) => {
            if (!profileData?.form_fields) return {};

            const validations = {};
            registeredValidations.forEach(validationFunc => {
                validationFunc(values, profileData, validations);
            });
            if (Object.entries(validations).length > 0) {
                setErrorList(Object.entries(validations).map(([key, val]) => {
                    return {
                        "field": profileData.form_fields.find(f => f.field.field_id == key).field.title,
                        "message": val,
                    };
                }));
            } else {
                setErrorList([]);
            }
            return validations;
        },
    });

    form.register = (func) => {
        registeredValidations.push(func);
    };

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
        form.isDirty(),
    );

    // Handle beforeunload
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (form.isDirty()) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
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
        setFiles(uploadedFiles);
        setUploadLimitExceeded(isValid);
        setMetadataIndex(metaIndex);
    };

    const handleFileUpload = async (file, brokerSubmissionId, isMetadata) => {
        const attach_to_ticket = false;
        const meta_data = isMetadata;
        try {
            console.log("hehehe");
            await uploadFileToS3(
                file,
                brokerSubmissionId,
                attach_to_ticket,
                meta_data,
                getToken(),
                (progressPercent) => {
                    console.log(`Upload progress for ${file.name}: ${progressPercent}%`);
                },
            );

            //TODO: remove after changing entire profile based ui to new models
            await createUploadFileChannel(
                brokerSubmissionId,
                file,
                attach_to_ticket,
                meta_data,
                getToken(),
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
            if (key === "embargo" || key === "files") return acc;

            // Keep arrays even if empty
            if (Array.isArray(value)) {
                acc[key] = value;
                return acc;
            }
            // Only include non-empty string values
            if (value !== "" && value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {});

        // TODO: fixed token value for local testing only
        if (submissionData?.broker_submission_id) {
            putSubmission(
                submissionData.broker_submission_id,
                profileData.target,
                embargoDate,
                filteredValues,
            )
                .then((result) => {
                    if (result?.broker_submission_id) {
                        const brokerSubmissionId = result.broker_submission_id;
                        const fileUploadPromises = files.map((file, index) =>
                            handleFileUpload(file, brokerSubmissionId, index === metadataIndex),
                        );
                        return Promise.all(fileUploadPromises).then(() => {
                            setShowLeaveDialog(false); // Close dialog after successful submission
                            sessionStorage.removeItem("successMessageShown");
                            navigate(pendingNavigation || ROUTER_BASE_URL, {
                                state: { update: true },
                            });
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
                .catch(handleSubmissionError)
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
                            sessionStorage.removeItem("successMessageShown");
                            navigate(pendingNavigation || ROUTER_BASE_URL, {
                                state: { create: true },
                            });
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
                .catch(handleSubmissionError)
                .finally(async () => {
                    await new Promise(r => setTimeout(r, 2000)); //prevent submit-button from getting available before page-redirect
                    setProcessing(false);
                });
        }
    };

    const handleSubmissionError = (error) => {
        if (error.response && error.response.data && error.response.data.data) {
            console.log(error.response.data);
            if (error.response.data.data && Array.isArray(error.response.data.data)) {
                setErrorList(
                    error.response.data.data.map((item) => {
                        let colonIdx = item.indexOf(" : ");
                        let field_id = item.substring(0, colonIdx);
                        let message = item.substring(colonIdx + 3);
                        if (profileData.form_fields.find(f => f.field.field_id == field_id)) {
                            field_id = profileData.form_fields.find(f => f.field.field_id == field_id).field.title;
                        }
                        return { "field": field_id, "message": message };
                    }),
                );

            }
        } else {
            console.error("Submission error: ", error);
        }
    };

    const createSubmitButton = () => {
        if (isProcessing) {
            return (
                <Button className="submission-button disabled" type="submit" disabled>
                    <i className="fa fa-gear me-3"></i> Processing...
                </Button>
            );
        } else if (submissionData?.broker_submission_id) {
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

    if (profileData === undefined || profileData === null) {
        return (
            <>
                <div className="row">
                    {/* TODO: general Error component needed to prevent hardcodes messages all over the place ... */}
                    <div className="col-md-9 main-col">
                        <h2 className={"danger"}>Sorry. No Profile could be loaded</h2>
                    </div>
                    <div className="col-md-3 side-col">

                    </div>
                </div>
            </>
        );
    }

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
                                    submissionData={submissionData}
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
                                    submissionData={submissionData}
                                ></FormField>
                            ))
                        }
                    </div>
                </div>
                <div className="row">
                    <Group mt="md" className="mt-5 col-md-9">
                        <ErrorBox errorList={errorList} />
                    </Group>
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

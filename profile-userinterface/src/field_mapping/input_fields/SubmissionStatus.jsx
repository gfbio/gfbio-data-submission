import { Button } from "@mantine/core";
import PropTypes from "prop-types";
import postSubmissionState from "../../api/postSubmissionState";
import { useState } from "react";

const SubmissionStatus = ({ title, submissionData }) => {
    const [currentStatus, setCurrentStatus] = useState(submissionData.status);
    const [errorMessage, setErrorMessage] = useState("");

    const setStatus = (status) => {
        postSubmissionState(submissionData, status)
            .then(() => {
                    setCurrentStatus(status);
                    setErrorMessage("");
                }
            )
            .catch(error => {
                console.log(error);
                setErrorMessage(`An error occured (${error.message}). Please try again or maybe try to reload the page.`);
            });
    };

    return (
        <div className="info-box">
            <header className="">
                <h2 className="omit-optional">{title}</h2>
            </header>
            <div>
                <Button size="sm" className="m-1 submission-state-button new" disabled={currentStatus == "OPEN"} 
                    onClick={() => setStatus("OPEN")}
                >
                    OPEN
                </Button>
                <Button size="sm" className="m-1 submission-state-button submitted" disabled={currentStatus == "SUBMITTED"}
                    onClick={() => setStatus("SUBMITTED")}
                >
                    SUBMITTED
                </Button>
                <Button size="sm" className="m-1 submission-state-button error" disabled={currentStatus == "ERROR"}
                    onClick={() => setStatus("ERROR")}
                >
                    ERROR
                </Button>
                <Button size="sm" className="m-1 submission-state-button cancelled" disabled={currentStatus == "CANCELLED"}
                    onClick={() => setStatus("CANCELLED")}
                >
                    CANCELLED
                </Button>
                <Button size="sm" className="m-1 submission-state-button closed" disabled={currentStatus == "CLOSED"}
                    onClick={() => setStatus("CLOSED")}
                >
                    CLOSED
                </Button>
            </div>
            {
                errorMessage && (
                    <div className="text-danger font-monospace fs-8">
                        <i class="fa fa-flash ps-2 pe-2"></i>
                        {errorMessage}
                    </div>
                )
            }
        </div>
    );
};


SubmissionStatus.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    mandatory: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    field_id: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
};

export default SubmissionStatus;

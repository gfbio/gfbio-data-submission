import { Button } from "@mantine/core";
import PropTypes from "prop-types";
import postSubmissionState from "../../api/postSubmissionState";
import { useState } from "react";

const SubmissionStatus = ({ title, submissionData }) => {
    const [currentStatus, setCurrentStatus] = useState(submissionData.status);
    console.log("SubmissionStatus: currentStatus = ", currentStatus, " submissionData.status = ", submissionData.status);

    return (
        <div className="info-box">
            <header className="">
                <h2 className="omit-optional">{title}</h2>
            </header>
            <div>
                <Button size="sm" className="m-1 submission-state-button new" disabled={currentStatus == "OPEN"} 
                    onClick={() => { postSubmissionState(submissionData, "OPEN").then(() => setCurrentStatus("OPEN")) }}
                >
                    OPEN
                </Button>
                <Button size="sm" className="m-1 submission-state-button submitted" disabled={currentStatus == "SUBMITTED"}
                    onClick={() => { postSubmissionState(submissionData, "SUBMITTED").then(() => setCurrentStatus("SUBMITTED")) }}
                >
                    SUBMITTED
                </Button>
                <Button size="sm" className="m-1 submission-state-button error" disabled={currentStatus == "ERROR"}
                    onClick={() => { postSubmissionState(submissionData, "ERROR").then(() => setCurrentStatus("ERROR")) }}
                >
                    ERROR
                </Button>
                <Button size="sm" className="m-1 submission-state-button cancelled" disabled={currentStatus == "CANCELLED"}
                    onClick={() => { postSubmissionState(submissionData, "CANCELLED").then(() => setCurrentStatus("CANCELLED")) }}
                >
                    CANCELLED
                </Button>
                <Button size="sm" className="m-1 submission-state-button closed" disabled={currentStatus == "CLOSED"}
                    onClick={() => { postSubmissionState(submissionData, "CLOSED").then(() => setCurrentStatus("CLOSED")) }}
                >
                    CLOSED
                </Button>
            </div>
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

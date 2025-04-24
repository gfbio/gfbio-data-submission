import {Collapse} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {Link, useLoaderData, useLocation} from "react-router-dom";
import deleteSubmission from "../api/deleteSubmission";
import SimpleModal from "./simpleModal";
import NavigationMenu from './NavigationMenu.jsx';

// SubmissionList component
const SubmissionList = (props) => {
    const baseUrl = props.baseUrl;
    const formUrl = baseUrl + "form/";
    const {state} = useLocation();
    const {submissions: initialSubmissions} = useLoaderData();
    const [submissions, setSubmissions] = useState(initialSubmissions);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);
    const [successHeader, setSuccessHeader] = useState("");
    const [successText, setSuccessText] = useState("");

    // Check if message was already shown in this session
    const hasShownMessage = sessionStorage.getItem('successMessageShown');
    const [isSuccessVisible, successVisibleHandlers] = useDisclosure(
        (state?.create || state?.update) && !hasShownMessage
    );

    useEffect(() => {
        if (state?.create) {
            setSuccessHeader("Your data was submitted !");
            setSuccessText(
                "Congratulations, you have started a data submission. " +
                "You will receive a confirmation email from the GFBio Helpdesk Team. " +
                "Please reply to this email if you have questions."
            );
        } else if (state?.update) {
            setSuccessHeader("Your submission was updated !");
            setSuccessText("The Update of your data was successful.");
        }
    }, [state]);

    const handleClose = () => {
        successVisibleHandlers.close();
        // Mark message as shown in this session
        sessionStorage.setItem('successMessageShown', 'true');
    };

    const handleDeleteClick = (submission) => {
        setSubmissionToDelete(submission);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (submissionToDelete) {
            try {
                await deleteSubmission(submissionToDelete.broker_submission_id);
                setSubmissions(
                    submissions.filter(
                        (sub) =>
                            sub.broker_submission_id !==
                            submissionToDelete.broker_submission_id
                    )
                );
            } catch (error) {
                console.error("Error deleting submission:", error);
                alert("Failed to delete submission. Please try again.");
            }
        }
        setIsDeleteModalOpen(false);
        setSubmissionToDelete(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setSubmissionToDelete(null);
    };

    return (
        <>
            <NavigationMenu />
            <div className="submission-list-wrapper">
                <Collapse in={isSuccessVisible}>
                    <div className="col-8 mx-auto success-message">
                        <div className="row">
                            <div className="col-1 mx-auto">
                                <i className="icon ion-md-checkmark-circle-outline"/>
                            </div>
                            <div className="col-8">
                                <h4>{successHeader}</h4>
                                <p>{successText}</p>
                            </div>
                            <div className="col-2">
                                <button
                                    className="btn btn-sm w-100 btn-green-inverted"
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Collapse>

                {submissions.length === 0 ? (
                    <div className="list-start-wrapper d-flex">
                        <div className="container my-auto">
                            <div className="row g-0 text-center">
                                <div className="col-md-10 ps-3 align-middle">
                                    <Link to={formUrl} className="nav-link list-start">
                                        <p>You have no submissions yet.</p>
                                        <p>Start a new submission</p>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="pt-3">
                        <div className="row g-0">
                            <div className="col-md-10 ps-3">
                                <div className="row g-0">
                                    <div className="col-md-8 align-self-center">
                                        <h6>Title</h6>
                                    </div>
                                    <div className="col-md-2 align-self-center">
                                        <h6>Status</h6>
                                    </div>
                                    <div className="col-md-2 align-self-center">
                                        <h6>Ticket</h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <ul className="list-group">
                            {submissions.map((submission) => (
                                <li
                                    key={submission.broker_submission_id}
                                    className="list-group-item"
                                >
                                    <div className="row g-0">
                                        <div className="col-md-10">
                                            <Link
                                                to={formUrl + submission.broker_submission_id}
                                                className="row g-0"
                                            >
                                                <div className="col-md-8 col-sm-12 align-self-center">
                                                    <i className="icon ion-md-apps"/>
                                                    <span>{submission.data.requirements.title}</span>
                                                </div>
                                                <div className="col-md-2 col-sm-12 align-self-center status">
                                                    <span>{submission.status}</span>
                                                </div>
                                                <div className="col-md-2 col-sm-12 align-self-center">
                                                    <span className="issue">{submission.issue}</span>
                                                </div>
                                            </Link>
                                        </div>
                                        <div className="col-md-2 col-sm-12 align-self-center actions">
                                            <Link
                                                to={formUrl + submission.broker_submission_id}
                                                className="action h-100 d-inline-block pe-4 btn btn-link"
                                            >
                                                <i className="icon ion-md-create"/> Edit
                                            </Link>
                                            <a
                                                className="action h-100 d-inline-block btn btn-link"
                                                onClick={() => handleDeleteClick(submission)}
                                            >
                                                <i className="icon ion-md-trash"/>Delete
                                            </a>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <SimpleModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    onConfirm={handleDeleteConfirm}
                    itemName={submissionToDelete?.data.requirements.title || ""}
                />
            </div>
        </>
    );
};

SubmissionList.propTypes = {
    baseUrl: PropTypes.string,
};

export default SubmissionList;

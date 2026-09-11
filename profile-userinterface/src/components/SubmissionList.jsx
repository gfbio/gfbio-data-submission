import {Collapse, Menu, Button, TextInput, Select} from '@mantine/core';
import {useDisclosure} from '@mantine/hooks';
import {useEffect, useState} from "react";
import {Link, useLocation} from "react-router-dom";
import deleteSubmission from "../api/deleteSubmission";
import SimpleModal from "./simpleModal";
import NavigationMenu from './NavigationMenu.jsx';
import {ROUTER_URL_CREATE, ROUTER_URL_EDIT} from "../settings.jsx";
import getCurrentUser from '../api/getCurrentUser.jsx';
import { formatDateTime } from '../utils/dateUtils.js';
import getListOfSubmissions from '../api/getListOfSubmissions.jsx';

const sortOptions = [
    {
        label: "Last Modified (Newest First)",
        field: "modified",
        direction: -1,
        icon: "fa-calendar",
        secondaryIcon: "fa-sort-down",
    },
    {
        label: "Last Modified (Oldest First)",
        field: "modified",
        direction: 1,
        icon: "fa-calendar",
        secondaryIcon: "fa-sort-up",
    },
//    {
//        label: "Title (A-Z)",
//        field: "title",
//        direction: 1,
//        icon: "fa-sort-alpha-asc",
//    },
//    {
//        label: "Title (Z-A)",
//        field: "title",
//        direction: -1,
//        icon: "fa-sort-alpha-desc",
//    },
];

const PAGE_SIZE = 10;

// SubmissionList component
const SubmissionList = (props) => {
    const {state} = useLocation();
    const [submissions, setSubmissions] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [submissionToDelete, setSubmissionToDelete] = useState(null);
    const [successHeader, setSuccessHeader] = useState("");
    const [successText, setSuccessText] = useState("");
    const [warnings, setWarnings] = useState([]);
    const [warningSubmissionId, setWarningSubmissionId] = useState(null);
    const [page, setPage] = useState(0);

    const hasWarnings = warnings.length > 0;

    // Check if message was already shown in this session
    const hasShownMessage = sessionStorage.getItem('successMessageShown');
    const [isSuccessVisible, successVisibleHandlers] = useDisclosure(
        (state?.create || state?.update) && !hasShownMessage
    );

    const [user, setUser] = useState(null);
    const [showCuratorView, setShowCuratorView] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: "",
        target: "",
        user: "",
        search: "",
    });

    const updateFilters = (updatedFilters) => {
        setFilters(updatedFilters);
        setPage(0);
    }

    const applyFilters = (submissions) => {
        return submissions.filter((submission) => {
            var search_value = filters.search ? filters.search.toLowerCase() : filters.search;
            var user_search_value = filters.user ? filters.user.toLowerCase() : filters.user;
            return (
                (!filters.status || submission.status == filters.status)
                && (!filters.target || submission.target == filters.target)
                && (!filters.user 
                    || submission.user.includes(user_search_value)
                    || (submission.user_email && submission.user_email.toLowerCase().includes(user_search_value))
                    || (submission.user_legal_name && submission.user_legal_name.toLowerCase().includes(user_search_value))
                )
                && (!filters.search 
                    || submission.broker_submission_id.toLowerCase().includes(search_value)
                    || submission.user.toLowerCase().includes(search_value)
                    || (submission.user_email && submission.user_email.toLowerCase().includes(search_value))
                    || (submission.user_legal_name && submission.user_legal_name.toLowerCase().includes(search_value))
                    || submission.issue.toLowerCase().includes(search_value)
                    || submission.data.requirements.title.toLowerCase().includes(search_value)
                    || submission.data.requirements.description.toLowerCase().includes(search_value)
                )
            );
        });
    }

    const [sorting, setSorting] = useState(sortOptions[0]);

    useEffect(() => {
        getListOfSubmissions({take: 10}).then((top10Submissions) => {
            setSubmissions(top10Submissions);
            if (top10Submissions.length < 10) {
                setIsLoading(false);
            }
            else {
                getListOfSubmissions({skip: 10}).then((queriedSubmissions) => {
                    setSubmissions(top10Submissions.concat(queriedSubmissions));
                    setIsLoading(false);
                }).catch((error) => {
                    console.error("Error fetching all other submissions:", error);
                })
            }
        }).catch((error) => {
            console.error("Error fetching top 10 recent submissions:", error);
        });
    }, []);


    useEffect(() => {
        getCurrentUser().then((userData) => {
            setUser(userData);
            if (userData && (userData.is_staff || userData.is_superuser || userData.groups.some(group => group == "Curators"))) {
                setShowCuratorView(true);
            }
        }).catch((error) => {
            console.error("Error fetching current user:", error);
        }); 
    }, []);

    useEffect(() => {
        const nextWarnings = Array.isArray(state?.warnings) ? state.warnings : [];
        setWarnings(nextWarnings);
        setWarningSubmissionId(state?.brokerSubmissionId || null);

        if (state?.create) {
            if (nextWarnings.length > 0) {
                setSuccessHeader("Your submission was created, but some steps failed");
                setSuccessText(
                    "The submission itself was saved successfully. " +
                    "Please review the details below and try again if needed."
                );
            } else {
                setSuccessHeader("Your data was submitted !");
                setSuccessText(
                    "Congratulations, you have started a data submission. " +
                    "You will receive a confirmation email from the GFBio Helpdesk Team. " +
                    "Please reply to this email if you have questions."
                );
            }
        } else if (state?.update) {
            if (nextWarnings.length > 0) {
                setSuccessHeader("Your submission was updated, but some steps failed");
                setSuccessText(
                    "Your changes were saved successfully. " +
                    "Please review the details below and try again if needed."
                );
            } else {
                setSuccessHeader("Your submission was updated !");
                setSuccessText("The Update of your data was successful.");
            }
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
                    <div className={`col-8 mx-auto success-message${hasWarnings ? " success-message-warning" : ""}`}>
                        <div className="row">
                            <div className="col-1 mx-auto">
                                <i className={`icon ${hasWarnings ? "ion-md-warning" : "ion-md-checkmark-circle-outline"}`}/>
                            </div>
                            <div className="col-8">
                                <h4>{successHeader}</h4>
                                <p>{successText}</p>
                                {hasWarnings && (
                                    <div className="success-message-warnings">
                                        {warnings.map((warning, index) => (
                                            <p key={index} className="success-message-warning-item">
                                                {warning}
                                            </p>
                                        ))}
                                        {warningSubmissionId && (
                                            <p className="success-message-warning-link">
                                                <Link to={ROUTER_URL_EDIT + warningSubmissionId}>
                                                    Open this submission to try again
                                                </Link>
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="col-2">
                                <button
                                    className={`btn btn-sm w-100 ${hasWarnings ? "btn-warning-inverted" : "btn-green-inverted"}`}
                                    onClick={handleClose}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Collapse>

                {
                    submissions === null ? (<></>) :
                    submissions.length === 0 ? (
                        <div className="list-start-wrapper d-flex">
                            <div className="container my-auto">
                                <div className="row g-0 text-center">
                                    <div className="col-md-12 ps-3 align-middle">
                                        <Link to={ROUTER_URL_CREATE} className="nav-link list-start d-flex flex-column align-items-center justify-content-center">
                                            <p>You have no submissions yet.</p>
                                            <p>Start a new submission</p>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className='pb-3'>
                                <div>
                                    <span className='c-pointer' onClick={() => setShowFilters(!showFilters)}>
                                        <i className={`fa fa-chevron-${showFilters ? 'down' : 'right pe-1'}  me-1`}/>
                                        Filters
                                    </span>
                                    {
                                        filters.search && (
                                            <span className="badge bg-primary ms-2">
                                                Search: {filters.search}
                                                <i className='fa fa-times ms-2 c-pointer' onClick={() => updateFilters({...filters, search: ""})} />
                                            </span>
                                        )
                                    }
                                    {
                                        filters.user && showCuratorView && (
                                            <span className="badge bg-primary ms-2">
                                                User: {filters.user}
                                                <i className='fa fa-times ms-2 c-pointer' onClick={() => updateFilters({...filters, user: ""})} />
                                            </span>
                                        )
                                    }
                                    {
                                        filters.status && (
                                            <span className="badge bg-primary ms-2">
                                                Status: {filters.status}
                                                <i className='fa fa-times ms-2 c-pointer' onClick={() => updateFilters({...filters, status: ""})} />
                                            </span>
                                        )
                                    }
                                    {
                                        filters.target && (
                                            <span className="badge bg-primary ms-2">
                                                Target: {filters.target}
                                                <i className='fa fa-times ms-2 c-pointer' onClick={() => updateFilters({...filters, target: ""})} />
                                            </span>
                                        )
                                    }
                                    {
                                        (filters.status || filters.target || filters.user || filters.search) && (
                                            <i className='fa fa-repeat fa-rotate-180 ms-4 c-pointer' onClick={() => updateFilters({
                                                status: "", target: "", user: "", search: "",
                                            })} />
                                        )
                                    }
                                </div>
                                <Collapse in={showFilters}>
                                    <div className="filter-section row">
                                        <div className={`col-12 ${showCuratorView ? 'col-xl-5' : 'col-xl-8'}`}>
                                            <TextInput id="search" label="Search" type="text" value={filters.search} onChange={(e) => updateFilters({...filters, search: e.target.value})} />
                                        </div>
                                        {
                                            showCuratorView && (
                                                <div className='col-4 col-lg-6 col-xl-3'>
                                                    <TextInput id="user-filter" label="User" type="text" value={filters.user} onChange={(e) => updateFilters({...filters, user: e.target.value})} />
                                                </div>
                                            )
                                        }
                                        <div className='d-flex flex-column col-4 col-lg-3 col-xl-2'>
                                            <Select id="status-filter" value={filters.status} label="Status" defaultValue={"All"}
                                                onChange={(value) => updateFilters({...filters, status: value})} 
                                                data={[{value: "", label: "All"}, ...[...new Set(submissions.map(submission => submission.status))].map(status => ({value: status, label: status}))]} 
                                            />
                                        </div>
                                        <div className='d-flex flex-column col-4 col-lg-3 col-xl-2'>
                                            <Select id="target-filter" value={filters.target} label="Target" defaultValue={"All"}
                                                onChange={(value) => updateFilters({...filters, target: value})} 
                                                data={[{value: "", label: "All"}, ...[...new Set(submissions.map(submission => submission.target))].map(target => ({value: target, label: target}))]}
                                            />
                                        </div>
                                    </div>
                                </Collapse>
                            </div>
                            <div className="pt-3">
                                <div className="row g-0 px-3">
                                    <div className="col-10 mb-2">
                                        <div className="row g-0">
                                            <div className="col-md-8 align-self-center d-flex">
                                                <h6 className='mb-0 mt-1'>Title</h6>
                                            </div>
                                            <div className="col-md-2 align-self-center d-flex">
                                                <h6 className='mb-0 mt-1'>Status</h6>
                                            </div>
                                            <div className="col-md-2 align-self-center">
                                                <h6 className='mb-0 mt-1'>Ticket</h6>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-2 text-end">
                                        <Menu>
                                            <Menu.Target>
                                                <span className='c-pointer'>
                                                    <i className={`fa ${sorting.icon}`}></i>
                                                    {
                                                        sorting.secondaryIcon && (
                                                            <i className={`fa ${sorting.secondaryIcon} ms-1`}></i>
                                                        )
                                                    }
                                                </span>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                {
                                                    sortOptions.map((option) => (
                                                        <Menu.Item key={option.value} onClick={() => setSorting(option)}>
                                                            
                                                            {
                                                                option.secondaryIcon ? (
                                                                    <>
                                                                        <i className={`fa ${option.icon} me-1`}/>
                                                                        <i className={`fa ${option.secondaryIcon} me-2`}/>
                                                                    </>
                                                                ) : <i className={`fa ${option.icon} ms-1 me-3`}/>
                                                            }
                                                            {option.label}
                                                        </Menu.Item>
                                                    ))
                                                }
                                            </Menu.Dropdown>
                                        </Menu>
                                    </div>
                                </div>
                                <ul className="list-group">
                                    {
                                        applyFilters(submissions).sort(
                                            (a, b) => {
                                                if (sorting.field === "modified") {
                                                    const dateA = new Date(a.modified);
                                                    const dateB = new Date(b.modified);
                                                    return (dateA - dateB) * sorting.direction;
                                                }
                                                else if (sorting.field === "title") {
                                                    const titleA = a.data.requirements.title.toLowerCase();
                                                    const titleB = b.data.requirements.title.toLowerCase();
                                                    if (titleA < titleB) return -sorting.direction;
                                                    if (titleA > titleB) return sorting.direction;
                                                    return 0;
                                                }
                                            }
                                        ).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((submission) => (
                                            <li
                                                key={submission.broker_submission_id}
                                                className="list-group-item"
                                            >
                                                {
                                                    showCuratorView && (
                                                        <div className="row g-0 curator-details align-items-center">
                                                            <div className="col-5 col-lg-4 col-xl-3 ">
                                                                <span className="submission-id font-monospace fs-8">
                                                                    {submission.broker_submission_id}
                                                                </span>
                                                            </div>
                                                            <div className="col-2 col-lg-3 col-xl-5 text-truncate ps-2">
                                                                <span className="user c-pointer" onClick={() => {updateFilters({...filters, user: submission.user});}}>
                                                                    <i className='fa align-center fa-user pe-1 fs-9'/>
                                                                    {submission.user}
                                                                </span>
                                                            </div>
                                                            <div className="col-2 text-center text-lg-end fs-8">
                                                                <span className="target c-pointer" onClick={() => {updateFilters({...filters, target: submission.target});}}>
                                                                    {submission.target}
                                                                </span>
                                                            </div>
                                                            <div className="col-3 col-xl-2 text-end font-monospace">
                                                                <span className="modified text-end">{formatDateTime(submission.modified)}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                <div className="row g-0">
                                                    <div className="col-md-10">
                                                        <Link
                                                            to={ROUTER_URL_EDIT + submission.broker_submission_id}
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
                                                            to={ROUTER_URL_EDIT + submission.broker_submission_id}
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
                                        ))
                                    }
                                </ul>
                            </div>
                        </>
                    )
                }
                {
                    isLoading && (
                        <div className="text-center mt-3">
                            <div className="spinner-border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    )
                }
                {
                    [0].map(() => {
                        if (submissions === null || submissions.length === 0) {
                            return null;
                        }
                        var filteredSubmissions = applyFilters(submissions);
                        var pages = Math.ceil(filteredSubmissions.length / PAGE_SIZE);
                        var minPage = Math.max(0, Math.min(page - 2, pages - 5));
                        var maxPage = Math.min(Math.max(5, page + 3), pages);
                        if (!filteredSubmissions || filteredSubmissions.length <= PAGE_SIZE) {
                            return null;
                        }
                        return (
                            <div className="d-flex justify-content-center mt-3">
                            
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(page - 1)}
                                    className="me-2"
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
                                {
                                    Array(maxPage - minPage).fill(1).map((_, index) => (
                                        <Button
                                            key={minPage + index}
                                            variant={minPage + index === page ? "filled" : "outline"}
                                            onClick={() => setPage(minPage + index)}
                                            className="me-2"
                                        >
                                            {minPage + index + 1}
                                        </Button>
                                    ))
                                }
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(page + 1)}
                                    disabled={(page + 1) * PAGE_SIZE >= filteredSubmissions.length}
                                >
                                    Next
                                </Button>
                            </div>
                        )
                    })
                }
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

export default SubmissionList;

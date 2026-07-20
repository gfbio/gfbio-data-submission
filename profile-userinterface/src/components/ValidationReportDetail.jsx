import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Loader, Alert} from "@mantine/core";
import NavigationMenu from "./NavigationMenu.jsx";
import getValidationReport from "../api/getValidationReport.jsx";
import {ROUTER_URL_EDIT} from "../settings.jsx";
import { HoverCard, Button, Text } from '@mantine/core';

const ValidationReportDetail = () => {
    const {brokerageId, reportId} = useParams();
    const navigate = useNavigate();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedGroups, setExpandedGroups] = useState({});

    const toggleGroup = (groupKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }));
    };

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const data = await getValidationReport(brokerageId, reportId);
                setReport(data);
                setError(null);
            } catch (err) {
                setError("Failed to load validation report. Please try again.");
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        if (brokerageId && reportId) {
            fetchReport();
        }
    }, [brokerageId, reportId]);

    const handleBackClick = () => {
        navigate(ROUTER_URL_EDIT + brokerageId + "/");
    };

    if (loading) {
        return (
            <>
                <NavigationMenu />
                <div className="validation-report-container">
                    <div className="text-center py-5">
                        <Loader size="lg" />
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <NavigationMenu />
                <div className="validation-report-container">
                    <Alert color="red" title="Error">
                        {error}
                    </Alert>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleBackClick}
                    >
                        Back to Submission
                    </button>
                </div>
            </>
        );
    }

    if (!report) {
        return (
            <>
                <NavigationMenu />
                <div className="validation-report-container">
                    <Alert color="yellow" title="No Report Found">
                        The validation report could not be found.
                    </Alert>
                    <button
                        className="btn btn-primary mt-3"
                        onClick={handleBackClick}
                    >
                        Go to Submission
                    </button>
                </div>
            </>
        );
    }

    return (
        <>
            <NavigationMenu />
            <div className="validation-report-container">
                <div className="container mt-4">
                    {renderReportInformation(report, handleBackClick)}
                    {renderReportTasks(report, expandedGroups, toggleGroup)}
                </div>
            </div>
        </>
    );
};

function renderReportTasks(report, expandedGroups, toggleGroup) {
    return <div className="row">
        <div className="col-12">
            <h2 className="omit-optional">Validation Findings</h2>
            {report.task_reports.map((taskReport, index) => {
                const groupKey = taskReport.task_name;
                const isExpanded = expandedGroups[groupKey] ?? false;
                const infoCount = taskReport.findings ? taskReport.findings.filter(f => f.status === 'INFO').length : 0;
                const warningCount = taskReport.findings ? taskReport.findings.filter(f => f.status === 'WARNING').length : 0;
                const errorCount = taskReport.findings ? taskReport.findings.filter(f => f.status === 'ERROR').length : 0;
                const totalCount = infoCount + warningCount + errorCount;

                const taskReportFindingsGroups = Object.groupBy(taskReport.findings, f => f.finding_type || 'Other');

                return (
                    <div key={index} className="task-report mb-4">
                        <div className="row collapsible-toggler" onClick={() => toggleGroup(groupKey)}>
                            <div className="col-10">
                                <i className={`fa ${getStatusIcon(taskReport.status)} me-2`} />
                                <span className="task-name">
                                    {taskReport.task_name}
                                </span>
                                {totalCount > 0 && (<i className={`fa fa-chevron-${isExpanded ? 'down' : 'right'} ms-2`} />)}
                            </div>
                            <div className="col-2 text-end">
                                {infoCount > 0 && <span className="badge bg-info">{infoCount}</span>}
                                {warningCount > 0 && <span className="badge bg-warning ms-1">{warningCount}</span>}
                                {errorCount > 0 && <span className="badge bg-danger ms-1">{errorCount}</span>}
                            </div>
                        </div>
                        {isExpanded && totalCount > 0 && renderTaskFindingsGroups(taskReportFindingsGroups, expandedGroups, groupKey, toggleGroup)}
                    </div>
                );
            })}
        </div>
    </div>;
}

function renderTaskFindingsGroups(taskReportFindingsGroups, expandedGroups, groupKey, toggleGroup) {
    return <>
        {Object.keys(taskReportFindingsGroups).map((findingsGroupKey) => {
            const isExpanded = expandedGroups[groupKey + '_' + findingsGroupKey] ?? false;
            const infoFindingsCount = taskReportFindingsGroups[findingsGroupKey].filter(f => f.status === 'INFO').length;
            const warningFindingsCount = taskReportFindingsGroups[findingsGroupKey].filter(f => f.status === 'WARNING').length;
            const errorFindingsCount = taskReportFindingsGroups[findingsGroupKey].filter(f => f.status === 'ERROR').length;
            const totalFindingsCount = infoFindingsCount + warningFindingsCount + errorFindingsCount;

            return (
                <div key={findingsGroupKey} className="finding-group ms-2 mt-2">
                    <div className="row collapsible-toggler" onClick={() => toggleGroup(groupKey + '_' + findingsGroupKey)}>
                        <div className="col-10">
                            {errorFindingsCount > 0
                                ? <i className="fa fa-times-circle pe-2 status-error" aria-hidden="true" />
                                : warningFindingsCount > 0
                                    ? <i className="fa fa-exclamation-triangle pe-2 status-warning" aria-hidden="true" />
                                    : <i className="fa fa-info-circle pe-2 status-info" aria-hidden="true" />}
                            <span className="finding-group-name">
                                {findingsGroupKey}
                            </span>
                            {totalFindingsCount > 0 && (<i className={`fa fa-chevron-${isExpanded ? 'down' : 'right'} ms-2`} />)}
                        </div>
                        <div className="col-2 text-end">
                            {infoFindingsCount > 0 && <span className="badge bg-info">{infoFindingsCount}</span>}
                            {warningFindingsCount > 0 && <span className="badge bg-warning ms-1">{warningFindingsCount}</span>}
                            {errorFindingsCount > 0 && <span className="badge bg-danger ms-1">{errorFindingsCount}</span>}
                        </div>
                    </div>
                    {isExpanded && renderFindingsList(taskReportFindingsGroups, findingsGroupKey)}
                </div>
            );
        })}
    </>;
}

function renderFindingsList(taskReportFindingsGroups, findingsGroupKey) {
    return <div className="ms-2">
        {taskReportFindingsGroups[findingsGroupKey].sort((b, a) => (b.row ? b.row : -1) - (a.row ? a.row : -1)).map((finding, idx) => (
            <div className="row mt-3 align-content-center">
                <div className="col-6 col-lg-3 align-content-center">
                    <div className="container">
                        <div className="row">
                            <div className="col-2 col-lg-1 align-content-center">
                                <i className={`fa ${getStatusIcon(finding.status)} me-2`} />
                            </div>
                            <div className="col-6 col-lg-8 align-content-center">
                                {finding.column_name ? `${finding.column_name}` : finding.column ? `${finding.column}` : ''}
                            </div>
                            <div className="col-3 col-lg-2 align-content-center text-end">
                                {finding.row ? `${finding.row}` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-6 col-lg-9 d-flex align-items-center justify-content-between">
                    <span>
                        {finding.message}
                    </span>
                    <HoverCard width={280} shadow="md">
                        <HoverCard.Target>
                            <i className="fa fa-question-circle-o ms-2"></i>
                        </HoverCard.Target>
                        <HoverCard.Dropdown>
                            <Text size="sm">
                                {finding.help_text}
                            </Text>
                        </HoverCard.Dropdown>
                    </HoverCard>
                </div>
            </div>
        ))}
    </div>;
}

function renderReportInformation(report, goToSubmission) {
    const findingGroups = Object.groupBy([...report.task_reports.map(tr => tr.findings)], f => f.status);
    const infoFindingsCount = findingGroups['INFO'] ? findingGroups['INFO'].length : 0;
    const warningFindingsCount = findingGroups['WARNING'] ? findingGroups['WARNING'].length : 0;
    const errorFindingsCount = findingGroups['ERROR'] ? findingGroups['ERROR'].length : 0;
    return <div className="row mb-4">
        <div className="col-12">
            <h2 className="omit-optional">Report for {report.filename || 'N/A'}</h2>
            <div className="d-flex flex-row justify-content-between">
                <div className="">
                    <div className="fw-semibold text-center">Submission</div>
                    <div className="text-center">
                        <a href={ROUTER_URL_EDIT + `${report.broker_submission_id}`} onClick={goToSubmission}>
                            {report.broker_submission_id}
                        </a>
                    </div>
                </div>
                <div className="">
                    <div className="fw-semibold text-center">
                        MD5-Checksum
                    </div>
                    <div className="text-center">
                        {report.file_md5_checksum}
                    </div>
                </div>
                <div className="">
                    <div className="fw-semibold text-center">
                        Created
                    </div>
                    <div className="text-center">
                        {new Date(report.created).toLocaleString()}
                    </div>
                </div>
            </div>
            <div className="row text-center">
                <div className="col-md-4">
                    <div className="summary-box status-error">
                        <div className="summary-count">
                            {errorFindingsCount}
                        </div>
                        <div className="summary-label">
                            Errors
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="summary-box status-warning">
                        <div className="summary-count">
                            {warningFindingsCount}
                        </div>
                        <div className="summary-label">
                            Warnings
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="summary-box status-info">
                        <div className="summary-count">
                            {infoFindingsCount}
                        </div>
                        <div className="summary-label">
                            Infos
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-4">
                {errorFindingsCount > 0 && (
                    <p>
                        The validation of your metadata file ran into errors. 
                        Please fix all the errors in your metadata file and reupload it, to proceed with the submission.
                    </p>
                )}
                {warningFindingsCount > 0 && (
                    <p>
                        The validation of your metadata file ran into warnings. 
                        We recommenend you improve the mentioned parts of your metadata file and reupload it, 
                        before proceeding with your submission. Otherwise please double-check the mentioned values 
                        and ensure they match your intentions.
                    </p>
                )}
                {infoFindingsCount > 0 && (
                    <p>
                        During the validation of your metadata file, several informational messages were generated. 
                        Please ensure the mentioned values match your intentions or improve your metadata file and reupload it, 
                        before proceeding with your submission.
                    </p>
                )}
                {infoFindingsCount == 0 && warningFindingsCount == 0 && errorFindingsCount == 0 && (
                    <p>
                        Your metadata file was successfully validated and should now be ready for the next steps.
                    </p>
                )}
            </div>
        </div>
    </div>;
}

function getStatusIcon(status) {
    switch (status) {
        case 'SUCCESS':
            return 'fa-check-circle status-success';
        case 'INFO':
            return 'fa-info-circle status-info';
        case 'ERROR':
            return 'fa-times-circle status-error';
        case 'WARNING':
            return 'fa-exclamation-triangle status-warning';
        case 'PENDING':
            return 'fa-spinner';
        default:
            return 'fa-circle';
    }
}

export default ValidationReportDetail;

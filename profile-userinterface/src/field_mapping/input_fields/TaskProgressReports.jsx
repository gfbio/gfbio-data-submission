import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { TASK_REFRESH_INTERVAL_MS } from "../../settings";
import getCuratorSubmissionTaskProgressReports from "../../api/getCuratorSubmissionTaskProgressReports";
import { formatDateTime } from "../../utils/dateUtils";

const TaskProgressReports = ({ title, submissionData }) => {
    const [extendedReport, setExtendedReport] = useState(null);
    const [isTaskReportsLoading, setIsTaskReportsLoading] = useState(false);
    const [isTaskReportsRefreshing, setIsTaskReportsRefreshing] = useState(false);
    const [taskReports, setTaskReports] = useState([]);

    const formatTaskPayload = (value) => {
        if (!value) {
            return "-";
        }
        try {
            const parsed = JSON.parse(value);
            return JSON.stringify(parsed, null, 2);
        } catch (error) {
            return value;
        }
    };

    const statusBadgeClass = (status) => {
        if (!status) {
            return "bg-secondary";
        }
        if (status.toUpperCase() === "SUCCESS") {
            return "bg-success";
        }
        if (status.toUpperCase() === "RUNNING") {
            return "bg-info";
        }
        if (status.toUpperCase() === "CANCELLED") {
            return "bg-secondary";
        }
        return "bg-danger";
    };

    useEffect(() => {
        let isMounted = true;
        const fetchTaskReports = async (isInitial = false) => {
            if (!submissionData.broker_submission_id) {
                return;
            }
            if (isInitial) {
                setIsTaskReportsLoading(true);
            } else {
                setIsTaskReportsRefreshing(true);
            }
            const data = await getCuratorSubmissionTaskProgressReports(
                submissionData.broker_submission_id
            );
            if (isMounted) {
                setTaskReports(data);
                setIsTaskReportsLoading(false);
                setIsTaskReportsRefreshing(false);
            }
        };

        fetchTaskReports(true);
        const interval = window.setInterval(
            () => fetchTaskReports(false),
            TASK_REFRESH_INTERVAL_MS
        );

        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, [submissionData]);

    return (
        <div>
            <header className="">
                <h2 className="omit-optional">{title}</h2>
                <p className="" />
            </header>
            <div className="card-header d-flex align-items-center justify-content-between">
                <span className="text-muted small">
                    {isTaskReportsRefreshing ? "Updating..." : "Auto-refresh 10s"}
                </span>
            </div>
            <div className="card-body">
                {isTaskReportsLoading && (
                    <div className="alert alert-info">Loading task progress...</div>
                )}
                {!isTaskReportsLoading && taskReports.length === 0 && (
                    <div className="alert alert-secondary">
                        No task progress reports available.
                    </div>
                )}
                {!isTaskReportsLoading && taskReports.length > 0 && (
                    <div className="table-responsive task-report-table-container">
                        <table className="table table-sm align-middle task-report-table">
                            <thead className="task-report-header">
                                <tr>
                                    <th>Task</th>
                                    <th>Status</th>
                                    <th>Modified</th>
                                </tr>
                            </thead>
                            <tbody className="task-report-body">
                                {taskReports.map((report) => (
                                    <>
                                        <tr key={report.task_id}  onClick={() => { setExtendedReport(extendedReport != report.task_id ? report.task_id : null); }} className="clickable-text main-row">
                                            <td><i className={`fa fa-chevron-${extendedReport == report.task_id ? 'down' : 'right me-1'} ms-2`} /> {report.task_name}</td>
                                            <td>
                                                <span className={`badge ${statusBadgeClass(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td>{formatDateTime(report.modified)}</td>
                                        </tr>
                                        {
                                            extendedReport == report.task_id && (
                                                <tr>
                                                    <td className="mt-2 ms-2" colspan="3">
                                                        <div className="mb-2">
                                                            <strong>Return Value</strong>
                                                            <pre className="bg-light p-2 border rounded allow-line-wrapping">
                                                                {formatTaskPayload(report.task_return_value)}
                                                            </pre>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Exception</strong>
                                                            <pre className="bg-light p-2 border rounded allow-line-wrapping">
                                                                {formatTaskPayload(report.task_exception)}
                                                            </pre>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Exception Info</strong>
                                                            <pre className="bg-light p-2 border rounded allow-line-wrapping">
                                                                {formatTaskPayload(report.task_exception_info)}
                                                            </pre>
                                                        </div>
                                                        <div className="mb-2">
                                                            <strong>Args</strong>
                                                            <pre className="bg-light p-2 border rounded allow-line-wrapping">
                                                                {formatTaskPayload(report.task_args)}
                                                            </pre>
                                                        </div>
                                                        <div>
                                                            <strong>Kwargs</strong>
                                                            <pre className="bg-light p-2 border rounded allow-line-wrapping">
                                                                {formatTaskPayload(report.task_kwargs)}
                                                            </pre>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

}

TaskProgressReports.propTypes = {
    title: PropTypes.string.isRequired,
    submissionData: PropTypes.object,
};

export default TaskProgressReports;

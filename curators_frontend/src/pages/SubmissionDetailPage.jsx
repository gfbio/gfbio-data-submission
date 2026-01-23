import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import getCuratorSubmissionDetail from "../api/getCuratorSubmissionDetail.jsx";
import getCuratorSubmissionTaskProgressReports from "../api/getCuratorSubmissionTaskProgressReports.jsx";
import getCuratorSubmissionCloudUploads from "../api/getCuratorSubmissionCloudUploads.jsx";

const TASK_REFRESH_INTERVAL_MS = 10000;

const SubmissionDetailPage = () => {
  const {brokerSubmissionId} = useParams();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [taskReports, setTaskReports] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [isTaskReportsLoading, setIsTaskReportsLoading] = useState(false);
  const [isTaskReportsRefreshing, setIsTaskReportsRefreshing] = useState(false);
  const [isUploadsLoading, setIsUploadsLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      setIsLoading(true);
      const data = await getCuratorSubmissionDetail(brokerSubmissionId);
      setDetail(data);
      setIsLoading(false);
    };
    fetchDetail();
  }, [brokerSubmissionId]);

  useEffect(() => {
    let isMounted = true;
    const fetchTaskReports = async (isInitial = false) => {
      if (!brokerSubmissionId) {
        return;
      }
      if (isInitial) {
        setIsTaskReportsLoading(true);
      } else {
        setIsTaskReportsRefreshing(true);
      }
      const data = await getCuratorSubmissionTaskProgressReports(
        brokerSubmissionId
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
  }, [brokerSubmissionId]);

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
    const fetchUploads = async () => {
      setIsUploadsLoading(true);
      const data = await getCuratorSubmissionCloudUploads(brokerSubmissionId);
      setUploads(data);
      setIsUploadsLoading(false);
    };
    fetchUploads();
  }, [brokerSubmissionId]);

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <Link className="btn btn-outline-secondary btn-sm" to="/">
          Back to list
        </Link>
        <h1 className="h4 m-0">Submission Details</h1>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          {isLoading && (
            <div className="alert alert-info">Loading details...</div>
          )}
          {!isLoading && detail && (
            <>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <strong>Submission ID</strong>
                  <div>{detail.broker_submission_id}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>User</strong>
                  <div>{detail.user}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Status</strong>
                  <div>{detail.status}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Target</strong>
                  <div>{detail.target}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Release</strong>
                  <div>{detail.release ? "Yes" : "No"}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Embargo</strong>
                  <div>{detail.embargo || "-"}</div>
                </div>
              </div>
              <div className="mb-3">
                <strong>Accession IDs</strong>
                <pre className="bg-light p-2 border rounded">
                  {JSON.stringify(detail.accession_id || [], null, 2)}
                </pre>
              </div>
              <div>
                <strong>Submission JSON</strong>
                <pre className="bg-light p-2 border rounded">
                  {JSON.stringify(detail.data || {}, null, 2)}
                </pre>
              </div>
            </>
          )}
          {!isLoading && !detail && (
            <div className="alert alert-warning">Submission not found.</div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex align-items-center justify-content-between">
          <span>Task Progress Reports</span>
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
            <div className="table-responsive">
              <table className="table table-sm table-striped align-middle">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Modified</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {taskReports.map((report) => (
                    <tr key={report.task_id}>
                      <td>{report.task_name}</td>
                      <td>
                        <span className={`badge ${statusBadgeClass(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td>{report.modified}</td>
                      <td>
                        <details>
                          <summary>View details</summary>
                          <div className="mt-2">
                            <div className="mb-2">
                              <strong>Return Value</strong>
                              <pre className="bg-light p-2 border rounded">
                                {formatTaskPayload(report.task_return_value)}
                              </pre>
                            </div>
                            <div className="mb-2">
                              <strong>Exception</strong>
                              <pre className="bg-light p-2 border rounded">
                                {formatTaskPayload(report.task_exception)}
                              </pre>
                            </div>
                            <div className="mb-2">
                              <strong>Exception Info</strong>
                              <pre className="bg-light p-2 border rounded">
                                {formatTaskPayload(report.task_exception_info)}
                              </pre>
                            </div>
                            <div className="mb-2">
                              <strong>Args</strong>
                              <pre className="bg-light p-2 border rounded">
                                {formatTaskPayload(report.task_args)}
                              </pre>
                            </div>
                            <div>
                              <strong>Kwargs</strong>
                              <pre className="bg-light p-2 border rounded">
                                {formatTaskPayload(report.task_kwargs)}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-header">Cloud Uploads</div>
        <div className="card-body">
          {isUploadsLoading && (
            <div className="alert alert-info">Loading uploads...</div>
          )}
          {!isUploadsLoading && uploads.length === 0 && (
            <div className="alert alert-secondary">No uploads available.</div>
          )}
          {!isUploadsLoading && uploads.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm table-striped align-middle">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Size</th>
                    <th>MD5</th>
                    <th>SHA256</th>
                    <th>Meta Data</th>
                    <th>Attach to Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {uploads.map((upload) => (
                    <tr key={upload.pk}>
                      <td>{upload.file_name || "-"}</td>
                      <td>{upload.file_size ?? "-"}</td>
                      <td>{upload.md5 || "-"}</td>
                      <td>{upload.sha256 || "-"}</td>
                      <td>{upload.meta_data ? "Yes" : "No"}</td>
                      <td>{upload.attach_to_ticket ? "Yes" : "No"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetailPage;

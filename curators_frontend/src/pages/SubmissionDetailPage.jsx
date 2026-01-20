import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import getCuratorSubmissionDetail from "../api/getCuratorSubmissionDetail.jsx";
import getCuratorSubmissionReports from "../api/getCuratorSubmissionReports.jsx";
import getCuratorSubmissionCloudUploads from "../api/getCuratorSubmissionCloudUploads.jsx";

const SubmissionDetailPage = () => {
  const {brokerSubmissionId} = useParams();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [isReportsLoading, setIsReportsLoading] = useState(false);
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
    const fetchReports = async () => {
      setIsReportsLoading(true);
      const data = await getCuratorSubmissionReports(brokerSubmissionId);
      setReports(data);
      setIsReportsLoading(false);
    };
    fetchReports();
  }, [brokerSubmissionId]);

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
        <div className="card-header">Reports</div>
        <div className="card-body">
          {isReportsLoading && (
            <div className="alert alert-info">Loading reports...</div>
          )}
          {!isReportsLoading && reports.length === 0 && (
            <div className="alert alert-secondary">No reports available.</div>
          )}
          {!isReportsLoading && reports.length > 0 && (
            <div className="table-responsive">
              <table className="table table-sm table-striped align-middle">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Report</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>{report.report_category}</td>
                      <td>{report.report}</td>
                      <td>{report.created}</td>
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

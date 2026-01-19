const SubmissionTable = ({submissions, isLoading}) => {
  if (isLoading) {
    return <div className="alert alert-info">Loading submissions...</div>;
  }

  if (!submissions.length) {
    return <div className="alert alert-secondary">No submissions found.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="table table-sm table-striped align-middle">
        <thead>
          <tr>
            <th>Submission ID</th>
            <th>User</th>
            <th>Status</th>
            <th>Target</th>
            <th>Release</th>
            <th>Embargo</th>
            <th>Modified</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <tr key={submission.broker_submission_id}>
              <td>{submission.broker_submission_id}</td>
              <td>{submission.user}</td>
              <td>{submission.status}</td>
              <td>{submission.target}</td>
              <td>{submission.release ? "Yes" : "No"}</td>
              <td>{submission.embargo || "-"}</td>
              <td>{submission.modified || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;

import PropTypes from "prop-types";
import { useState } from "react";

const SubmissionOverview = ({title, submissionData}) => {
    const [showJson, setShowJson] = useState(false);

    return (
        <div>
            <header className="">
                <h2 className="omit-optional">{title}</h2>
                <p className=""/>
            </header>
            <>
              <div className="row g-3 mb-3">
                <div className="col-12 col-md-4">
                  <strong>Submission ID</strong>
                  <div>{submissionData.broker_submission_id}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>User</strong>
                  <div>{submissionData.user}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Status</strong>
                  <div>{submissionData.status}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Target</strong>
                  <div>{submissionData.target}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Release</strong>
                  <div>{submissionData.release ? "Yes" : "No"}</div>
                </div>
                <div className="col-12 col-md-4">
                  <strong>Embargo</strong>
                  <div>{submissionData.embargo || "-"}</div>
                </div>
              </div>
              <div className="mb-3">
                <strong>Accession IDs</strong>
                <pre className="bg-light p-2 border rounded">
                  {JSON.stringify(submissionData.accession_id || [], null, 2)}
                </pre>
              </div>
              <div>
                <strong onClick={() => { setShowJson(!showJson); }} className="clickable-text">
                    Submission JSON <i className={`fa fa-chevron-${showJson ? 'down' : 'right'} ms-2`} />
                </strong>
                {
                    showJson && (
                        <pre className="bg-light p-2 border rounded">
                            {JSON.stringify(submissionData.data || {}, null, 2)}
                        </pre>
                    )
                }
              </div>
            </>
        </div>
    );
}

SubmissionOverview.propTypes = {
    title: PropTypes.string.isRequired,
    submissionData: PropTypes.object,
};

export default SubmissionOverview;

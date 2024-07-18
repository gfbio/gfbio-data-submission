import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import getListOfSubmissions from "../api/getListOfSubmissions";

const SubmissionList = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const submissionsList = await getListOfSubmissions();
      setSubmissions(submissionsList);
    };

    fetchSubmissions();
  }, []);

  return (
    <div>
      {submissions.length === 0 ? (
        <div className="list-start-wrapper d-flex">
          <div className="container my-auto">
            <div className="row no-gutters text-center">
              <div className="col-md-10 pl-3 align-middle">
                <Link to="/form" className="nav-link list-start">
                  <p>You have no submissions yet.</p>
                  <p>Start a new submission</p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-3">
          <div className="row no-gutters">
            <div className="col-md-10 pl-3">
              <div className="row no-gutters">
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
                <div className="row wrapping-row no-gutters">
                  <div className="col-md-10">
                    <Link
                      to={"/form/" + submission.broker_submission_id}
                      className="row no-gutters"
                    >
                      <div className="col-md-8 col-sm-12 align-self-center">
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
                      to={"/form/" + submission.broker_submission_id}
                      className="action h-100 d-inline-block pr-4 btn btn-link"
                    >
                      Edit
                    </Link>
                    <button
                      className="action h-100 d-inline-block btn btn-link"
                      href=""
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SubmissionList;

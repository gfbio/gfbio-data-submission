import { useEffect, useState } from "react";
import getListOfSubmissions from "../api/getListOfSubmissions";

const SubmissionList = () => {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const submissionsList = await getListOfSubmissions();
        setSubmissions(submissionsList);
      } catch (error) {
        console.error("Error fetching submissions:", error);
      }
    };

    fetchSubmissions();
  }, []);

  return (
    <div>
      {submissions.length === 0 ? (
        <p>You have no submissions yet.</p>
      ) : (
        <ul>
          {submissions.map((submission) => (
            <li key={submission.broker_submission_id}>
              {submission.data.requirements.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SubmissionList;

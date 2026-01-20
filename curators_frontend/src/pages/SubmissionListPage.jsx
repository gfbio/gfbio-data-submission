import {useEffect, useMemo, useState} from "react";
import getCuratorSubmissions from "../api/getCuratorSubmissions.jsx";
import SubmissionTable from "../components/SubmissionTable.jsx";

const DEFAULT_PAGE_SIZE = 25;
const STATUS_OPTIONS = ["OPEN", "SUBMITTED", "CANCELLED", "ERROR", "CLOSED"];
const TARGET_OPTIONS = ["ENA", "ENA_PANGAEA", "GENERIC", "ATAX"];

const SubmissionListPage = () => {
  const [page, setPage] = useState(1);
  const [response, setResponse] = useState({
    count: 0,
    next: null,
    previous: null,
    results: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: [],
    target: [],
    user: "",
    search: "",
    ordering: "-modified",
  });

  const fetchParams = useMemo(
    () => ({
      page,
      ...filters,
    }),
    [page, filters]
  );

  useEffect(() => {
    const fetchSubmissions = async () => {
      setIsLoading(true);
      const data = await getCuratorSubmissions(fetchParams);
      setResponse(data);
      setIsLoading(false);
    };
    fetchSubmissions();
  }, [fetchParams]);

  const totalPages = Math.max(1, Math.ceil(response.count / DEFAULT_PAGE_SIZE));

  const handleMultiSelect = (event) => {
    const values = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    const name = event.target.name;
    setFilters((current) => ({
      ...current,
      [name]: values,
    }));
    setPage(1);
  };

  const handleInputChange = (event) => {
    const {name, value} = event.target;
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
    setPage(1);
  };

  const handleReset = () => {
    setFilters({
      status: [],
      target: [],
      user: "",
      search: "",
      ordering: "-modified",
    });
    setPage(1);
  };

  return (
    <div className="container mt-4">
      <h1 className="h3 mb-3">Curator Submissions</h1>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-3">
              <label className="form-label">Search</label>
              <input
                className="form-control"
                name="search"
                value={filters.search}
                onChange={handleInputChange}
                placeholder="Submission ID, user, ticket"
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">User</label>
              <input
                className="form-control"
                name="user"
                value={filters.user}
                onChange={handleInputChange}
                placeholder="Username or email"
              />
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                name="status"
                value={filters.status}
                onChange={handleMultiSelect}
                multiple
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Target</label>
              <select
                className="form-select"
                name="target"
                value={filters.target}
                onChange={handleMultiSelect}
                multiple
              >
                {TARGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-3">
              <label className="form-label">Ordering</label>
              <select
                className="form-select"
                name="ordering"
                value={filters.ordering}
                onChange={handleInputChange}
              >
                <option value="-modified">Modified (desc)</option>
                <option value="modified">Modified (asc)</option>
                <option value="-created">Created (desc)</option>
                <option value="created">Created (asc)</option>
                <option value="status">Status (asc)</option>
                <option value="-status">Status (desc)</option>
                <option value="target">Target (asc)</option>
                <option value="-target">Target (desc)</option>
                <option value="user">User (asc)</option>
                <option value="-user">User (desc)</option>
              </select>
            </div>
            <div className="col-12 col-md-3 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={!response.previous || isLoading}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          disabled={!response.next || isLoading}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
        >
          Next
        </button>
        <span className="text-muted">
          Page {page} of {totalPages} · Total {response.count}
        </span>
      </div>

      <SubmissionTable submissions={response.results} isLoading={isLoading} />
    </div>
  );
};

export default SubmissionListPage;

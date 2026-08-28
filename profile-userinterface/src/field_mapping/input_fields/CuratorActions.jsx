import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { TASK_REFRESH_INTERVAL_MS } from "../../settings";
import getCuratorSubmissionActions from "../../api/getCuratorSubmissionActions";
import runCuratorSubmissionAction from "../../api/runCuratorSubmissionAction";

const CuratorActions = ({ title, submissionData, options }) => {
    const [actions, setActions] = useState([]);
    const [isActionsLoading, setIsActionsLoading] = useState(false);
    const [actionStates, setActionStates] = useState({});
    const [actionMessages, setActionMessages] = useState([]);

    useEffect(() => {
        const fetchActions = async () => {
            setIsActionsLoading(true);
            const data = await getCuratorSubmissionActions(submissionData.broker_submission_id);
            if (options && options.length > 0) {
                // Filter actions based on provided options
                const filteredActions = data.filter(action =>
                    options.some(opt => opt.option === action.label)
                );
                setActions(filteredActions);
            } else {
                setActions(data);
            }
            setIsActionsLoading(false);
        };
        fetchActions();
    }, [submissionData]);

    const addActionMessage = (message) => {
        const id = `${message.type}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        setActionMessages((current) => [...current, { ...message, id }]);
        window.setTimeout(() => {
            setActionMessages((current) => current.filter((entry) => entry.id !== id));
        }, TASK_REFRESH_INTERVAL_MS);
    };

    const handleAction = async (action) => {
        if (!action?.key) {
            return;
        }
        if (action.danger) {
            const confirmed = window.confirm(
                `Are you sure you want to run "${action.label}"?`
            );
            if (!confirmed) {
                setActionStates((current) => ({
                    ...current,
                    [action.key]: { status: "cancelled", message: "Cancelled by user." },
                }));
                addActionMessage({
                    type: "secondary",
                    text: "Action cancelled.",
                });
                return;
            }
        }
        setActionStates((current) => ({
            ...current,
            [action.key]: { status: "running" },
        }));
        const result = await runCuratorSubmissionAction(
            submissionData.broker_submission_id,
            action
        );
        setActionStates((current) => ({
            ...current,
            [action.key]: result,
        }));
        if (result?.status === "error") {
            addActionMessage({
                type: "danger",
                text: result.error || "Action failed.",
            });
        } else {
            addActionMessage({
                type: "success",
                text: result.message || "Action queued.",
            });
        }
    };

    const groupedActions = actions.reduce((acc, action) => {
        const group = action.group || "Other";
        if (!acc[group]) {
            acc[group] = [];
        }
        acc[group].push(action);
        return acc;
    }, {});

    return (
        <div>
            <header className="">
                <h2 className="omit-optional">{title}</h2>
                <p className="" />
            </header>
            {isActionsLoading && (
                <div className="alert alert-info">Loading actions...</div>
            )}
            {!isActionsLoading && actions.length === 0 && (
                <div className="alert alert-secondary">
                    No actions available.
                </div>
            )}
            {!isActionsLoading &&
                Object.entries(groupedActions).map(([group, groupActions]) => (
                    <div className="mb-3" key={group}>
                        <div className="fw-semibold mb-2">{group}</div>
                        <div className="d-flex flex-wrap gap-2">
                            {groupActions.map((action) => {
                                const state = actionStates[action.key];
                                const isRunning = state?.status === "running";
                                const isCancelled = state?.status === "cancelled";
                                return (
                                    <div key={action.key} className="d-flex flex-column">
                                        <button
                                            className={`btn btn-sm ${action.danger ? "btn-danger" : "btn-outline-primary"
                                                }`}
                                            onClick={() => handleAction(action)}
                                            disabled={isRunning}
                                        >
                                            {isRunning ? "Running..." : action.label}
                                        </button>
                                        {isCancelled && (
                                            <small className="text-muted">Cancelled.</small>
                                        )}
                                        {state?.message && (
                                            <small className="text-muted">{state.message}</small>
                                        )}
                                        {state?.error && (
                                            <small className="text-danger">{state.error}</small>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
        </div>
    );

}

CuratorActions.propTypes = {
    title: PropTypes.string.isRequired,
    submissionData: PropTypes.object,
    options: PropTypes.arrayOf(PropTypes.shape({
        option: PropTypes.string.isRequired
    })).isRequired,
};

export default CuratorActions;

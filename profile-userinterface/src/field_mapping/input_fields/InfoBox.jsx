import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { JIRA_ROOT, ROUTER_URL_VALIDATIONS } from "../../settings.jsx";
import getLatestValidationReport from "../../api/getLatestValidationReport.jsx";

const InfoBox = ({title, submissionData}) => {
    const [latestValidationReport, setLatestValidationReport] = useState(null);
    const [isFetchingLatestReport, setIsFetchingLatestReport] = useState(false);

    useEffect(() => {
        const brokerSubmissionId = submissionData?.broker_submission_id;
        if (!brokerSubmissionId) {
            setIsFetchingLatestReport(false);
            setLatestValidationReport(null);
            return;
        }

        setIsFetchingLatestReport(true);

        getLatestValidationReport(brokerSubmissionId)
            .then(report => {
                if (report) {
                    setLatestValidationReport(report);
                }
            })
            .catch(() => {
                setLatestValidationReport(null);
            })
            .finally(() => {
                setIsFetchingLatestReport(false);
            });
    }, [submissionData?.broker_submission_id]);

    const validationReport = latestValidationReport ?? submissionData?.validation_reports;

    const infoItems = () => {

        const items = [];
        let key = 0;

        const mailToLink = `mailto:info@gfbio.org?subject=Help with Submission ${
            submissionData?.broker_submission_id
        }&body=Dear GFBio Team,`;

        if (submissionData?.broker_submission_id) {
            items.push(
                <li key={key} className="list-group-item">
                    <a>
                        <i className="fa fa-bookmark-o" aria-hidden="true"/>
                        Submission Id: <br/>
                        <div className="data-field">{submissionData?.broker_submission_id}</div>
                    </a>
                </li>
            );
            key++;
        }
        if (submissionData?.accession_id && submissionData?.accession_id.length > 0) {
            items.push(
                <li key={key} className="list-group-item">
                    <a>
                        <i className="fa fa-archive pe-2" aria-hidden="true"/>
                        ENA Accession:
                        <br/>
                    </a>
                    {
                        submissionData.accession_id.map(accession => {
                            return (
                                <div className="data-field">
                                    <div className="">
                                        <span style={{fontWeight: 600}}>ID</span>: {accession.pid}
                                    </div>
                                    <div className="" style={{marginTop: 0}}>
                                        <span style={{fontWeight: 600}}>Status</span>:{' '}
                                        {accession.status}
                                    </div>
                                </div>
                            );
                        })
                    }
                </li>
            );
            key++;
        }
        if (submissionData?.issue && submissionData?.issue.length > 0) {
            items.push(
                <li key={key} className="list-group-item">
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external"
                        href={JIRA_ROOT + submissionData?.issue}
                    >
                        <i className="fa fa-tags pe-2" aria-hidden="true"/>
                        Ticket:
                        <br/>
                        <div className="data-field">{submissionData?.issue}</div>
                    </a>
                </li>
            );
            key++;
        }

        const validationStatusIcon = () => {
            if (!validationReport?.status) {
                return <i className="fa fa-question-circle-o" aria-hidden="true" />;
            }

            switch (validationReport.status) {
                case 'ERROR':
                    return <i className="fa fa-times-circle pe-2 status-error" aria-hidden="true" />;
                case 'WARNING':
                    return <i className="fa fa-exclamation-triangle pe-2 status-warning" aria-hidden="true" />;
                case 'INFO':
                    return <i className="fa fa-info-circle pe-2 status-info" aria-hidden="true" />;
                default:
                    return <i className="fa fa-check-circle pe-2 status-success" aria-hidden="true" />;
            }
        };

        // Add Metadata validation report section
        items.push(
            <li key={key} className="list-group-item">
                <span className="info-title d-flex align-items-center">
                    {
                        isFetchingLatestReport 
                        ?  <span className="pe-2"><i className="fa fa-spinner fa-spin  p-0 fs-5" aria-hidden="true" /></span>
                        : validationStatusIcon()
                    }
                    Validations:
                    <br/>
                </span>
                <div className="data-field">
                    {validationReport ? (
                        <span className="validation-report-status d-flex justify-content-between align-items-center">
                            <a
                                href={
                                    ROUTER_URL_VALIDATIONS
                                    + `${submissionData.broker_submission_id}/validation-report/${validationReport.id}/`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="external"
                            >
                                Metadata validation report
                            </a>
                            {validationStatusIcon()}
                        </span>
                    ) : isFetchingLatestReport ? (
                        <span className="validation-report-status d-flex justify-content-between align-items-center">
                            <span>Loading latest validation report...</span>
                            <i className="fa fa-spinner fa-spin p-0" aria-hidden="true" />
                        </span>
                    ) : (
                        'No validation report available'
                    )}
                </div>
            </li>
        );
        key++;

        if (submissionData?.readOnly) {
            items.push(
                <li key={key} className="list-group-item">
                    <a>
                        <i className="fa fa-info-circle pe-2" aria-hidden="true" />
                        Status: <br/>
                        <div className="data-field">
                            Your data was already archived and only the embargo date can be
                            changed. If you need to make other changes, please contact our team
                            by replying to the corresponding Helpdesk ticket.
                        </div>
                    </a>
                </li>,
            );
            key++;
        }

        items.push(
            <li key={key} className="list-group-item">
                <a href={mailToLink} className="external">
                    <i className="fa fa-comments pe-2" aria-hidden="true"/>
                    Do you need Help ?
                </a>
            </li>,
        );
        key++;
        return items;
    };

    return (
        <div className="info-box">
            <header className="">
                <h2 className="omit-optional">{title}</h2>
                <p className=""/>
            </header>
            <div className="submission-info">
                <ul className="list-group list-group-flush">
                    {infoItems()}
                </ul>
            </div>
        </div>
    );
}

InfoBox.propTypes = {
    title: PropTypes.string.isRequired,
    submissionData: PropTypes.object,
};

export default InfoBox;

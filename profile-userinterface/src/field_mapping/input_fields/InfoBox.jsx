import PropTypes from "prop-types";
import { JIRA_ROOT } from "../../settings.jsx";

const InfoBox = ({title, submissionData}) => {

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
                        <i className="fa fa-bookmark-o pe-2" aria-hidden="true"/>
                        Submission Id: <br/>
                        <div className="data-field">{submissionData?.broker_submission_id}</div>
                    </a>
                </li>
            );
            key++;
        }
        if (submissionData?.accessionId && submissionData?.accessionId.length > 0) {
            items.push(
                <div className="info-box-header">
                    <i className="fa fa-archive pe-2" aria-hidden="true"/>
                    ENA Accession:
                    <br/>
                </div>,
            );
            submissionData?.accessionId.forEach(accession => {
                    items.push(
                        <li key={key} className="list-group-item">
                            <div className="data-field">
                                <div className="">
                                    <span style={{fontWeight: 600}}>ID</span>: {accession.pid}
                                </div>
                                <div className="" style={{marginTop: 0}}>
                                    <span style={{fontWeight: 600}}>Status</span>:{' '}
                                    {accession.status}
                                </div>
                            </div>
                        </li>
                    );
                    key++;
                }
            );
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

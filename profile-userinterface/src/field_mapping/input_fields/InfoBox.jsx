import {JIRA_ROOT} from "../../settings.jsx";

const InfoBox = (props) => {
    const {title, description, form, options, field_id} = props;

    const infoItems = () => {
        const submission = JSON.parse(localStorage.getItem('submission'));
        const brokerSubmissionId = submission.broker_submission_id || ''

        const items = [];
        let key = 0;

        const mailToLink = `mailto:info@gfbio.org?subject=Help with Submission ${
            brokerSubmissionId
        }&body=Dear GFBio Team,`;

        if (brokerSubmissionId.length > 0) {
            items.push(
                <li key={key} className="list-group-item">
                    <a>
                        <i className="fa fa-bookmark-o pr-2" aria-hidden="true"/>
                        Submission Id: <br/>
                        <div className="data-field">{brokerSubmissionId}</div>
                    </a>
                </li>
            );
            key++;
        }
        if (submission.accessionId && submission.accessionId.length > 0) {
            items.push(
                <div className="info-box-header">
                    <i className="fa fa-archive pr-2" aria-hidden="true"/>
                    ENA Accession:
                    <br/>
                </div>,
            );
            submission.accessionId.forEach(accession => {
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
        if (submission.issue && submission.issue.length > 0) {
            items.push(
                <li key={key} className="list-group-item">
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="external"
                        href={JIRA_ROOT + submission.issue}
                    >
                        <i className="fa fa-tags pr-2" aria-hidden="true"/>
                        Ticket:
                        <br/>
                        <div className="data-field">{submission.issue}</div>
                    </a>
                </li>
            );
            key++;
        }

        if (submission.readOnly) {
            items.push(
                <li key={key} className="list-group-item">
                    <a>
                        <i className="fa fa-info-circle pr-2" aria-hidden="true" />
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
                    <i className="fa fa-comments pr-2" aria-hidden="true"/>
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
            <div className="">
                <ul className="list-group list-group-flush">
                    {infoItems()}
                </ul>
            </div>
        </div>
    );
}

export default InfoBox;

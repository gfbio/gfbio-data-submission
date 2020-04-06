from gfbio_submissions.users.models import User

from gfbio_submissions.brokerage.models import Submission, BrokerObject, \
    PersistentIdentifier

user = User.objects.first()

Submission.objects.create(
        user=user,
        status='OPEN',
        submitting_user=user.id,
        target='ENA',
        release=False,
        data={"requirements": {"title": "WITHOUT PID", "license": "CC BY 4.0", "categories": [], "description": "some long description about submission", "contributors": [], "dataset_labels": [], "legal_requirements": [], "related_publications": []}}
        )

Submission.objects.create(
        user=user,
        status='OPEN',
        submitting_user=user.id,
        target='ENA',
        release=False,
        data={"requirements": {"title": "PUBLIC PID", "license": "CC BY 4.0", "categories": [], "description": "some long description about submission", "contributors": [], "dataset_labels": [], "legal_requirements": [], "related_publications": []}}
        )
    
Submission.objects.create(
        user=user,
        status='OPEN',
        submitting_user=user.id,
        target='ENA',
        release=False,
        data={"requirements": {"title": "PRIVATE PID", "license": "CC BY 4.0", "categories": [], "description": "some long description about submission", "contributors": [], "dataset_labels": [], "legal_requirements": [], "related_publications": []}}
        )

public_bo = BrokerObject.objects.create(
        type='study',
        user=user,
        data={
            "center_name": "GFBIO",
            "study_abstract": "Study abstract",
            "study_title": "title 1",
            "study_alias": "alias_1"}
        )

private_bo = BrokerObject.objects.create(
        type='study',
        user=user,
        data={
            'center_name': 'GFBIO',
            'study_abstract': 'abstract',
            "study_title": "title 2",
            "study_alias": "alias_2"}
        )

PersistentIdentifier.objects.create(
    archive='ENA',
    pid_type='PRJ',
    broker_object=public_bo,
    status='PUBLIC',
    pid='ERP0815',
    outgoing_request_id='da76ebec-7cde-4f11-a7bd-35ef8ebe5b85'
    )

PersistentIdentifier.objects.create(
    archive='ENA',
    pid_type='PRJ',
    broker_object=private_bo,
    pid='PRJEB0815',
    status='PRIVATE',
    outgoing_request_id='da76ebec-7cde-4f11-a7bd-35ef8ebe5b85'
    )

public_bo.submissions.add(Submission.objects.all()[1])
private_bo.submissions.add(Submission.objects.all()[2])

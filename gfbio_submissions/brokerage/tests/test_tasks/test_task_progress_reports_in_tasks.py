# -*- coding: utf-8 -*-
import uuid
from uuid import uuid4

import responses

# from gfbio_submissions.brokerage.models import Submission, \
#     TaskProgressReport
from gfbio_submissions.brokerage.tasks import \
    create_broker_objects_from_submission_data_task, \
    add_accession_to_pangaea_issue_task
from gfbio_submissions.generic.models import SiteConfiguration
from .test_tasks_base import TestTasks
from ...models.submission import Submission
from ...models.task_progress_report import TaskProgressReport


class TestTaskProgressReportInTasks(TestTasks):

    @staticmethod
    def _run_task(submission_id=1):
        create_broker_objects_from_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission_id
            }
        )

    @responses.activate
    def test_create_with_retry_task(self):
        submission = Submission.objects.first()
        site_config = SiteConfiguration.objects.first()
        submission.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )
        responses.add(
            responses.POST,
            '{0}/{1}/comment'.format(site_config.pangaea_jira_server.url,
                                     'PANGAEA_FAKE_KEY'),
            status=500)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(0, len(tprs))
        add_accession_to_pangaea_issue_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PANGAEA_FAKE_KEY'
                },
                # 'comment_body': 'ACC 12345'
            }
        )

        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        reports = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        report = reports.last()

        reps = TaskProgressReport.objects.all()
        self.assertEqual('SUCCESS', report.status)

    def test_task_report_creation(self):
        submission = Submission.objects.first()
        self.assertEqual(0, len(TaskProgressReport.objects.all()))

        self._run_task(submission_id=submission.pk)
        task_reports = TaskProgressReport.objects.all()

        self.assertEqual(1, len(task_reports))
        report = TaskProgressReport.objects.first()
        self.assertEqual(
            'tasks.create_broker_objects_from_submission_data_task',
            report.task_name
        )

    def test_task_report_update_after_return(self):
        self._run_task(submission_id=Submission.objects.first().pk)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        tpr = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task').first()
        self.assertEqual('SUCCESS', tpr.status)
        self.assertNotEqual('', tpr.task_kwargs)

    def test_task_report_update_invalid_task_id(self):
        self._run_task(submission_id=Submission.objects.first().pk)
        report, created = TaskProgressReport.objects.update_report_after_return(
            status='TEST',
            task_id=uuid4(),
        )
        self.assertTrue(created)
        self.assertEqual('no_name_provided', report.__str__())

    def test_task_report_update_on_wrong_submission(self):
        self._run_task(submission_id=1111)
        tprs = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task')
        self.assertEqual(1, len(tprs))
        tpr = TaskProgressReport.objects.exclude(
            task_name='tasks.update_helpdesk_ticket_task').first()
        self.assertEqual('SUCCESS', tpr.status)
        self.assertEqual('CANCELLED', tpr.task_return_value)

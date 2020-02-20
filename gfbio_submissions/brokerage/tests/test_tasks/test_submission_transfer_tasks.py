# -*- coding: utf-8 -*-

import responses
from celery import chain
from django.test import override_settings

from gfbio_submissions.brokerage.models import SiteConfiguration, Submission, \
    AuditableTextData, PersistentIdentifier, \
    BrokerObject
from gfbio_submissions.brokerage.tasks import prepare_ena_submission_data_task, \
    transfer_data_to_ena_task, process_ena_response_task
from gfbio_submissions.brokerage.tests.utils import \
    _get_ena_xml_response, \
    _get_ena_error_xml_response
from .test_tasks_base import TestTasks


class TestSubmissionTransferTasks(TestTasks):

    def test_prepare_ena_submission_data_task(self):
        submission = Submission.objects.first()
        text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(text_data))
        result = prepare_ena_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission.pk
            }
        )
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, dict))
        self.assertIn('SAMPLE', ret_val.keys())
        text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(text_data))

    @responses.activate
    def test_transfer_to_ena_task_successful(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            )
        )()
        text_data = AuditableTextData.objects.filter(submission=submission)
        self.assertEqual(4, len(text_data))
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, tuple))

    # TODO: add test where nonsense content is returned like '' or {}
    @responses.activate
    def test_transfer_to_ena_task_client_error(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=400,
            body=_get_ena_error_xml_response()
        )
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            )
        )()
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, tuple))

    @responses.activate
    @override_settings(CELERY_TASK_ALWAYS_EAGER=False,
                       CELERY_TASK_EAGER_PROPAGATES=False)
    def test_transfer_to_ena_task_server_error(self):
        submission = Submission.objects.first()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=500,
            body='{}'
        )
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            )
        ).apply()
        # ret_val = result.get()
        self.assertEqual('RETRY', submission.taskprogressreport_set.filter(
            task_name='tasks.transfer_data_to_ena_task').first().status)

    # TODO: add test where nonsense content is returned like '' or {}
    @responses.activate
    def test_process_ena_response_task_successful(self):
        responses.add(responses.PUT,
                      'https://www.example.com/rest/api/2/issue/FAKE_KEY',
                      body='', status=200)
        submission = Submission.objects.first()
        # fix ids to match ena_response.xml test-data aliases when running
        # multiple tests
        related_broker_objects = BrokerObject.objects.filter(
            submissions=submission)
        for i in range(0, len(related_broker_objects)):
            related_broker_objects[i].pk = i + 1
            related_broker_objects[i].save()

        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )
        self.assertEqual(0, len(PersistentIdentifier.objects.all()))
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=submission.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=submission.pk
            ),
            process_ena_response_task.s(
                submission_id=submission.pk
            )
        )()
        ret_val = result.get()
        self.assertTrue(result.successful())
        self.assertTrue(ret_val)
        self.assertLess(0, len(PersistentIdentifier.objects.all()))

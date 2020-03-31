# -*- coding: utf-8 -*-
import os
import shutil

import responses
from django.core.files.uploadedfile import SimpleUploadedFile

from config.settings.base import MEDIA_ROOT
from gfbio_submissions.brokerage.configuration.settings import ENA_PANGAEA, \
    GENERIC
from gfbio_submissions.brokerage.models import Submission, TaskProgressReport
from gfbio_submissions.brokerage.tests.utils import \
    _get_test_data_dir_path
from gfbio_submissions.users.models import User
from .test_submission_view_base import \
    TestSubmissionView


class TestSubmissionViewDataCenterCheck(TestSubmissionView):

    @classmethod
    def tearDownClass(cls):
        super(TestSubmissionViewDataCenterCheck, cls).tearDownClass()
        [shutil.rmtree(path='{0}{1}{2}'.format(MEDIA_ROOT, os.sep, o),
                       ignore_errors=False) for o in os.listdir(MEDIA_ROOT)]

    @responses.activate
    def test_ena_datacenter_no_files(self):
        self._add_create_ticket_response()

        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': True,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)
        expected_tasks = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.check_on_hold_status_task']
        for t in TaskProgressReport.objects.filter(
                submission=submission).order_by('created'):
            self.assertIn(t.task_name, expected_tasks)

    @responses.activate
    def test_ena_datacenter_with_suitable_file_after_put(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': False,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)
        with open(os.path.join(_get_test_data_dir_path(),
                               'csv_files/molecular_metadata.csv'),
                  'rb') as csv_file:
            uploaded_file = SimpleUploadedFile(
                name='molecular.csv',
                content_type='text/csv',
                content=csv_file.read()
            )

        submission.submissionupload_set.create(
            submission=submission,
            # site=User.objects.first(),
            user=User.objects.first(),
            meta_data=True,
            file=uploaded_file,
        )
        self.assertEqual(1, len(
            submission.submissionupload_set.filter(meta_data=True)))
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {'target': 'GENERIC', 'release': True,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)
        expected_tasks = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.check_on_hold_status_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.update_submission_issue_task',
            'tasks.update_helpdesk_ticket_task',  # x2
            'tasks.trigger_submission_transfer_for_updates',
            'tasks.create_broker_objects_from_submission_data_task',
            'tasks.prepare_ena_submission_data_task']
        for t in TaskProgressReport.objects.filter(
                submission=submission).order_by('created'):
            self.assertIn(t.task_name, expected_tasks)

    @responses.activate
    def test_ena_datacenter_with_unsuitable_file_after_put(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': False,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)
        with open(os.path.join(_get_test_data_dir_path(),
                               'ena_data.json'), 'rb') as csv_file:
            uploaded_file = SimpleUploadedFile(
                name='molecular.csv',
                content_type='text/json',
                content=csv_file.read()
            )

        submission.submissionupload_set.create(
            submission=submission,
            # site=User.objects.first(),
            user=User.objects.first(),
            meta_data=True,
            file=uploaded_file,
        )
        self.assertEqual(1, len(
            submission.submissionupload_set.filter(meta_data=True)))
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {'target': 'GENERIC', 'release': True,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)
        expected_tasks = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.create_broker_objects_from_submission_data_task',
            'tasks.prepare_ena_submission_data_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.update_submission_issue_task',
            'tasks.update_helpdesk_ticket_task',
            'tasks.trigger_submission_transfer_for_updates',
            'tasks.check_on_hold_status_task'
        ]
        for t in TaskProgressReport.objects.filter(
                submission=submission).order_by('created'):
            self.assertIn(t.task_name, expected_tasks)

    @responses.activate
    def test_ena_datacenter_with_binary_file_after_put(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': False,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)

        submission.submissionupload_set.create(
            submission=submission,
            # site=User.objects.first(),
            user=User.objects.first(),
            meta_data=True,
            file=SimpleUploadedFile('test.png', b'\x00\x01\x02\x03'),
        )
        self.assertEqual(1, len(
            submission.submissionupload_set.filter(meta_data=True)))
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {'target': 'GENERIC', 'release': True,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description',
                     'data_center': 'ENA – European Nucleotide Archive'}}},
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)
        expected_tasks = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.create_broker_objects_from_submission_data_task',
            'tasks.prepare_ena_submission_data_task',
            'tasks.trigger_submission_transfer',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.update_submission_issue_task',
            'tasks.update_helpdesk_ticket_task',
            'tasks.trigger_submission_transfer_for_updates',
            'tasks.check_on_hold_status_task'
        ]
        for t in TaskProgressReport.objects.filter(
                submission=submission).order_by('created'):
            self.assertIn(t.task_name, expected_tasks)

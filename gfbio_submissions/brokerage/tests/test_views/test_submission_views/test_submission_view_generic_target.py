# -*- coding: utf-8 -*-
import json
import os
import urllib
from urllib.parse import urlencode
from uuid import UUID, uuid4

import responses
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse

from gfbio_submissions.brokerage.configuration.settings import ENA_PANGAEA, \
    GENERIC
from gfbio_submissions.brokerage.models import Submission, RequestLog, \
    TaskProgressReport, AdditionalReference
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_test_data_dir_path, \
    _get_submission_post_response
from gfbio_submissions.users.models import User
from .test_submission_view_base import \
    TestSubmissionView


class TestSubmissionViewMinimumPosts(TestSubmissionView):

    def test_invalid_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post('/api/submissions/',
                                        {'target': 'ENA', 'data': {}},
                                        format='json'
                                        )
        self.assertEqual(400, response.status_code)
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('optional_validation', keys)
        self.assertIn('data', keys)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_schema_error_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post('/api/submissions/',
                                        {'target': 'ENA',
                                         'data': {'requirements': {}}},
                                        format='json'
                                        )
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(400, response.status_code)
        self.assertIn('data', content.keys())
        self.assertListEqual(
            ["requirements : 'title' is a required property",
             "requirements : 'description' is a required property"],
            content['data'])
        self.assertEqual(0, len(Submission.objects.all()))

    @responses.activate
    def test_valid_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'data': {'requirements': {
                'title': 'A Title',
                'description': 'A Description'}}},
            format='json'
        )
        content = json.loads(response.content.decode('utf-8'))
        expected = {
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'data': {'optional_validation': [
                # "requirements : 'study_type' is a required property",
                "requirements : 'samples' is a required property",
                "requirements : 'experiments' is a required property"],
                'requirements': {'description': 'A Description',
                                 'title': 'A Title'}},
            # 'embargo': '{0}'.format(
            #     datetime.date.today() + datetime.timedelta(days=365)),
            # TODO: better defaults in model
            'embargo': None,
            'download_url': '',
            'release': False,
            'user': 'horst',
            # 'site_project_id': '',
            'status': 'OPEN',
            'submitting_user': '',
            'target': 'ENA'
        }
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.last()

        self.assertEqual(UUID(content['broker_submission_id']),
                         submission.broker_submission_id)
        # self.assertIsNotNone(submission.embargo)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        # self.assertEqual(0, len(submission.site_project_id))
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(0, len(submission.submitting_user))
        self.assertEqual(0,
                         len(submission.submitting_user_common_information))
        # site_config = SiteConfiguration.objects.first()
        # self.assertIn(site_config.contact,
        #               submission.submitting_user_common_information)
        self.assertEqual('ENA', submission.target)
        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

    @responses.activate
    def test_valid_explicit_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self._post_submission()
        content = json.loads(response.content.decode('utf-8'))
        expected = {
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'data': {'optional_validation': [
                # u"requirements : 'study_type' is a required property",
                u"requirements : 'samples' is a required property",
                u"requirements : 'experiments' is a required property"],
                'requirements': {'description': 'A Description',
                                 'title': 'A Title'}},
            # 'embargo': '{0}'.format(
            #     datetime.date.today() + datetime.timedelta(days=365)),
            # TODO: better defaults in model
            'embargo': None,
            'download_url': '',
            'release': False,
            'user': 'horst',
            # 'site_project_id': '',
            'status': 'OPEN',
            'submitting_user': '',
            'target': 'ENA'}
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.last()
        self.assertEqual(UUID(expected['broker_submission_id']),
                         submission.broker_submission_id)

    @responses.activate
    def test_min_post_without_target(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'release': False, 'target': 'nonsense', 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(400, response.status_code)
        self.assertIn(b'target', response.content)
        self.assertEqual(0, len(Submission.objects.all()))


class TestSubmissionViewFullPosts(TestSubmissionView):

    @responses.activate
    def test_empty_max_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True, 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(400, response.status_code)
        self.assertNotIn(b'study_alias', response.content)

        # 02.03.2020: study_type was removed in Oct/Nov 2019 !
        self.assertNotIn(b'study_type', response.content)

        self.assertIn(b'samples', response.content)
        self.assertIn(b'experiments', response.content)
        self.assertEqual(0, len(Submission.objects.all()))

    # FIXME: in unit tests: "id": "file:///opt/project/staticfiles/schemas/minimal_requirements.json",
    # FIXME: when running docker-compose with dev.yml
    # FIXME: id to /app/staticfiles/schemas/ena_requirements.json
    # FIXME: since id determins root for looking up included files
    @responses.activate
    def test_valid_max_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True,
             'data': _get_submission_request_data()},
            format='json'
        )
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(201, response.status_code)
        expected = _get_submission_post_response()
        # expected['embargo'] = '{0}'.format(
        #     datetime.date.today() + datetime.timedelta(days=365))
        expected['broker_submission_id'] = content['broker_submission_id']
        self.assertDictEqual(expected, content)
        self.assertNotIn('download_url', content['data']['requirements'].keys())
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(UUID(expected['broker_submission_id']),
                         submission.broker_submission_id)
        self.assertEqual(Submission.SUBMITTED,
                         content.get('status', 'NOPE'))
        self.assertEqual('', submission.download_url)

    @responses.activate
    def test_valid_max_post_target_generic(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        # since no generic field is mandatory
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': True,
             'data': {
                 'requirements': {
                     'title': 'A Title',
                     'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        # expected = _get_submission_post_response()
        # expected['embargo'] = '{0}'.format(
        #     datetime.date.today() + datetime.timedelta(days=365))
        # expected['broker_submission_id'] = content['broker_submission_id']
        # self.assertDictEqual(expected, content)
        # self.assertNotIn('download_url', content['data']['requirements'].keys())
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        # self.assertEqual(UUID(expected['broker_submission_id']),
        #                  submission.broker_submission_id)
        self.assertEqual(Submission.SUBMITTED,
                         content.get('status', 'NOPE'))
        self.assertEqual('', submission.download_url)

    # TODO: move to dedicatet test class
    @responses.activate
    def test_valid_generic_post_with_molecular_meta_data(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        title = 'A Title for meta-data in GENERIC'
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)

        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_meta_data()
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(submission.submissionupload_set.all()))
        self.assertTrue(submission.submissionupload_set.first().meta_data)

        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)
        self.assertNotIn('validation', submission.data.keys())

        expected_task_names = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.update_submission_issue_task',
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer_for_updates',
            'tasks.check_on_hold_status_task',
            'tasks.create_broker_objects_from_submission_data_task',
            'tasks.prepare_ena_submission_data_task',
        ]
        all_task_reports = list(
            TaskProgressReport.objects.values_list(
                'task_name', flat=True).order_by('created')
        )
        self.assertListEqual(expected_task_names, all_task_reports)

        self.assertEqual(
            1,
            len(submission.brokerobject_set.filter(type='study'))
        )
        study = submission.brokerobject_set.filter(type='study').first()
        self.assertEqual(title, study.data.get('study_title', ''))

        self.assertEqual(
            3,
            len(submission.brokerobject_set.filter(type='sample'))
        )
        sample = submission.brokerobject_set.filter(type='sample').first()
        self.assertEqual('Sample No. 1', sample.data.get('sample_title', ''))

        self.assertEqual(
            3,
            len(submission.brokerobject_set.filter(type='experiment'))
        )
        experiment = submission.brokerobject_set.filter(
            type='experiment').first()
        self.assertIn('files', experiment.data.keys())

        submission_text_data = list(
            submission.auditabletextdata_set.values_list(
                'name', flat=True).order_by('created')
        )
        expected_text_data_names = [
            'study.xml',
            'sample.xml',
            'experiment.xml',
            'run.xml'
        ]
        for s in submission_text_data:
            self.assertIn(s, expected_text_data_names)

    # TODO: move to dedicatet test class
    @responses.activate
    def test_update_with_molecular_meta_data_csv(self):
        self._add_create_ticket_response()
        self._add_update_ticket_response()
        title = 'A Title for meta-data in GENERIC'
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_meta_data()
        response = self.api_client.post(url, data, format='multipart')
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)

        data = self._create_test_meta_data(delete=False, update=True)
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(2, len(submission.submissionupload_set.all()))
        original_upload = submission.submissionupload_set.get(
            file='{0}/molecular_metadata.csv'.format(
                submission.broker_submission_id
            )
        )
        update_upload = submission.submissionupload_set.get(
            file='{0}/molecular_metadata_for_update.csv'.format(
                submission.broker_submission_id
            )
        )
        original_upload.meta_data = False
        original_upload.save()
        self.assertFalse(original_upload.meta_data)
        self.assertTrue(update_upload.meta_data)

        self.assertEqual(10, len(submission.brokerobject_set.all()))
        self.assertEqual(4, len(submission.auditabletextdata_set.all()))

        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        sample = submission.brokerobject_set.filter(type='sample').first()
        self.assertEqual('Update-Sample No. 1',
                         sample.data.get('sample_title', ''))

        self.assertEqual(10, len(submission.brokerobject_set.all()))
        self.assertEqual(4, len(submission.auditabletextdata_set.all()))

        data = self._create_test_meta_data(delete=True, invalid=True)
        response = self.api_client.post(url, data, format='multipart')
        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)

    # TODO: move to dedicatet test class
    @responses.activate
    def test_valid_generic_post_with_invalid_molecular_meta_data(self):
        self.maxDiff = None

        self._add_create_ticket_response()
        self._add_update_ticket_response()
        title = 'A Title for meta-data in GENERIC'
        response = self.api_client.post(
            '/api/submissions/',
            {
                'target': 'GENERIC', 'release': False,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(GENERIC, submission.target)

        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': submission.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        data = self._create_test_meta_data(invalid=True)
        response = self.api_client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(submission.submissionupload_set.all()))
        self.assertTrue(submission.submissionupload_set.first().meta_data)

        response = self.api_client.put(
            '/api/submissions/{0}/'.format(submission.broker_submission_id),
            {
                'target': 'GENERIC', 'release': True,
                'data': {
                    'requirements': {
                        'title': title,
                        'description': 'A Description',
                        'data_center': 'ENA – European Nucleotide Archive'
                    }
                }
            },
            format='json'
        )
        self.assertEqual(200, response.status_code)
        submission = Submission.objects.first()
        self.assertEqual(ENA_PANGAEA, submission.target)
        self.assertIn('validation', submission.data.keys())
        self.assertEqual(2, len(submission.data.get('validation', [])))

        expected_task_names = [
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.create_submission_issue_task',
            'tasks.get_gfbio_helpdesk_username_task',
            'tasks.update_submission_issue_task',
            'tasks.check_for_molecular_content_in_submission_task',
            'tasks.trigger_submission_transfer_for_updates',
            'tasks.check_on_hold_status_task',
            # 'tasks.create_broker_objects_from_submission_data_task',
            # 'tasks.prepare_ena_submission_data_task',
        ]
        all_task_reports = list(
            TaskProgressReport.objects.values_list(
                'task_name', flat=True).order_by('created')
        )

        for a in all_task_reports:
            print('\n', a)

        self.assertListEqual(expected_task_names, all_task_reports)

        self.assertEqual(0, len(submission.brokerobject_set.all()))
        self.assertEqual(0, len(submission.auditabletextdata_set.all()))

        # check_tasks = TaskProgressReport.objects.filter(
        #     task_name='tasks.check_for_molecular_content_in_submission_task')
        # for c in check_tasks:
        #     self.assertIn('messages', c.task_return_value)

    @responses.activate
    def test_valid_max_post_with_data_url(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        url = 'https://www.google.de'
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True,
             'data': _get_submission_request_data(),
             'download_url': url},
            format='json'
        )
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.first()
        self.assertEqual(url, submission.download_url)

        # FIXME: Why extra PUT in this POST test ? Regression Test ?
        # response = self.client.put(
        #     '/api/submissions/{0}/'.format(
        #         sub.broker_submission_id),
        #     content_type='application/json',
        #     data=json.dumps({
        #         'target': 'ENA',
        #         'data': new_data_copy,
        #         'download_url': '{0}/{1}'.format(url, 'download'),
        #     }), **VALID_USER)
        # self.assertEqual(200, response.status_code)
        # self.assertEqual(7, len(Submission.objects.all()))
        # sub = Submission.objects.last()
        # self.assertEqual('{0}/{1}'.format(url, 'download'),
        #                  sub.download_url)

    # TODO: test valid max post with embargo value in data

    def test_valid_max_post_with_invalid_min_data(self):
        self.assertEqual(0, len(Submission.objects.all()))
        data = _get_submission_request_data()
        data['requirements'].pop('description')
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': True, 'data': data},
            format='json'
        )
        self.assertEqual(400, response.status_code)
        self.assertIn('description', response.content.decode('utf-8'))
        self.assertEqual(0, len(Submission.objects.all()))


class TestSubmissionViewDataCenterCheck(TestSubmissionView):

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


# FIXME: duplicate of below ?
class TestSubmissionViewGetRequest(TestSubmissionView):

    @responses.activate
    def test_get_submissions(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.get('/api/submissions/')
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertEqual(1, len(content))

    # TODO: note that 'site' has access to ALL submission created with
    #  its credentials
    @responses.activate
    def test_get_submissions_for_site_user(self):
        self._add_create_ticket_response()
        self._post_submission()
        self.other_api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': False, 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )
        self.assertEqual(2, len(Submission.objects.all()))
        response = self.api_client.get('/api/submissions/')
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(content))

    @responses.activate
    def test_get_submission(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()
        submission.brokerobject_set.create(
            type='study',
            user=User.objects.first(),
        )
        submission.brokerobject_set.filter(
            type='study'
        ).first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJE0815'
        )
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(content['accession_id'], 'PRJE0815')
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertEqual('horst', content['user'])

    @responses.activate
    def test_get_submission_with_helpdesk_issue(self):
        self._add_create_ticket_response()
        self._post_submission()
        submission = Submission.objects.first()

        AdditionalReference.objects.create(
            submission=submission,
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            primary=True,
            reference_key='SAND-0815',
        )

        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertIn('issue', content)
        self.assertEqual('SAND-0815', content.get('issue', 'NO_ISSUE'))

    @responses.activate
    def test_no_submission_for_id(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(uuid4()))
        self.assertEqual(404, response.status_code)

    @responses.activate
    def _prepare_submissions_for_various_users(self):
        self._add_gfbio_helpdesk_user_service_response(
            user_name='regular_user_2', email='re2@gu.la')
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.id)
        self._post_submission_with_submitting_user(regular_user.id)
        regular_user_2 = User.objects.get(username='regular_user_2')
        self._post_submission_with_submitting_user(regular_user_2.id)
        self._post_submission()
        # 1 - horst - no submitting_user
        # 2 - reg. - reg
        # 1 - reg2 -reg2
        # total 4

    @responses.activate
    def test_get_submissions(self):
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.id)
        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(regular_user.id))
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(submissions))
        self.assertEqual('{0}'.format(regular_user.id),
                         submissions[0].get('submitting_user', 'xxx'))

    @responses.activate
    def test_get_submissions_with_email_id(self):
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.email)
        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(regular_user.email))
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(submissions))
        self.assertEqual('{0}'.format(regular_user.email),
                         submissions[0].get('submitting_user', 'xxx'))

    @responses.activate
    def test_get_submissions_unknown_userid(self):
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.id)
        self._post_submission_with_submitting_user(regular_user.id)
        response = self.api_client.get('/api/submissions/user/687879/')
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(0, len(submissions))

    # @responses.activate
    def test_get_submissions_various_user_ids(self):
        # self._add_gfbio_helpdesk_user_service_response('regular_user_2', 're2@gu.la')
        self._prepare_submissions_for_various_users()
        self.assertEqual(4, len(Submission.objects.all()))

        regular_user = User.objects.get(username='regular_user')
        regular_user_2 = User.objects.get(username='regular_user_2')
        horst = User.objects.get(username='horst')

        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(regular_user.id))
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(2, len(submissions))

        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(regular_user_2.id))
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(submissions))

        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(horst.id))
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertEqual(0, len(submissions))

    @responses.activate
    def test_get_submissions_with_special_characters_id(self):
        self._add_create_ticket_response()
        user_identifier = '?=§$%@@!"\'!&//()ß´`^°#~,مليسيا'
        self._post_submission_with_submitting_user(user_identifier)
        submission = Submission.objects.first()
        self.assertEqual(user_identifier, submission.submitting_user)
        # quote before using such a string in an url
        quoted = urllib.parse.quote(user_identifier)
        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(quoted))
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertEqual(1, len(submissions))
        self.assertEqual('{0}'.format(user_identifier),
                         submissions[0].get('submitting_user', 'xxx'))

    def test_get_no_submissions_for_user(self):
        response = self.api_client.get(
            '/api/submissions/user/69/')
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertListEqual(submissions, [])

    def test_get_no_parameter(self):
        response = self.api_client.get(
            '/api/submissions/user/')
        self.assertEqual(404, response.status_code)

    @responses.activate
    def test_get_submissions_no_credentials(self):
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.id)
        response = self.client.get(
            '/api/submissions/user/{0}/'.format(regular_user.id))
        self.assertEqual(401, response.status_code)

    @responses.activate
    def test_get_submissions_content(self):
        self._add_create_ticket_response()
        regular_user = User.objects.get(username='regular_user')
        self._post_submission_with_submitting_user(regular_user.id)
        self._post_submission_with_submitting_user(regular_user.id)
        response = self.api_client.get(
            '/api/submissions/user/{0}/'.format(regular_user.id))
        self.assertEqual(200, response.status_code)
        submissions = json.loads(response.content.decode('utf-8'))
        self.assertIsInstance(submissions, list)
        self.assertEqual(2, len(submissions))
        self.assertIsInstance(submissions[0], dict)


class TestSubmissionViewGenericTarget(TestSubmissionView):

    def test_post_empty_generic(self):
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'release': False, 'data': {}},
            format='json'
        )
        self.assertEqual(400, response.status_code)
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('optional_validation', keys)
        self.assertIn('data', keys)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_schema_error_min_post(self):
        self.assertEqual(0, len(Submission.objects.all()))
        response = self.api_client.post('/api/submissions/',
                                        {'target': 'GENERIC',
                                         'data': {'requirements': {}}},
                                        format='json'
                                        )
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(400, response.status_code)
        self.assertIn('data', content.keys())
        self.assertListEqual(
            ["requirements : 'title' is a required property",
             "requirements : 'description' is a required property"],
            content['data'])
        self.assertEqual(0, len(Submission.objects.all()))

    @responses.activate
    def test_valid_min_post(self):
        self._add_create_ticket_response()
        self.assertEqual(0, len(Submission.objects.all()))
        self.assertEqual(0, len(RequestLog.objects.all()))
        response = self.api_client.post(
            '/api/submissions/',
            {'target': 'GENERIC', 'data': {
                'requirements': {
                    'title': 'A Generic Title',
                    'description': 'A Generic Description'}}},
            format='json'
        )
        content = json.loads(response.content.decode('utf-8'))
        # No 'optional_validation' since all generic special fields
        # are non-mandatory
        expected = {
            'embargo': None,
            'download_url': '',
            'status': 'OPEN',
            'release': False,
            'broker_submission_id': content['broker_submission_id'],
            'issue': '',
            'target': 'GENERIC',
            'user': 'horst',
            'submitting_user': '',
            'data': {
                'requirements': {
                    'description': 'A Generic Description',
                    'title': 'A Generic Title'
                }
            }
        }
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(1, len(Submission.objects.all()))
        submission = Submission.objects.last()
        self.assertEqual(UUID(content['broker_submission_id']),
                         submission.broker_submission_id)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        # self.assertEqual(0, len(submission.site_project_id))
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(0, len(submission.submitting_user))
        self.assertEqual('GENERIC', submission.target)
        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

    # TODO: move to integration-test file
    # TODO: modify to use new endpoints

    # --------------------------------------------------------------------------
    # @skip('test against debug server, that needs to be up and running')
    # def test_post_to_debug_server_full_submission(self):
    #     response = requests.post(
    #         url='http://127.0.0.1:8000/brokerage/submissions/full',
    #         data=json.dumps(FullWorkflowTest.content),
    #         headers={
    #             'Authorization': 'Token e4501de7f37d3044778f7939155f90cfb1625c6e',
    #             'Content-Type': 'application/json'}
    #     )

    # @skip('test against GWDG')
    # def test_post_to_gwdg_server(self):
    #     # let form validation fail
    #     # self.content['sample'] = 2
    #     # access existing submission
    #     # self.content['broker_submission_id'] = 'cdd73460-eec7-40a3-9a1f-f0a314f821f3'
    #     # change site_project_id
    #     # self.content['site_project_id'] = 'p8'
    #
    #     response = requests.post(
    #         url='http://c103-170.cloud.gwdg.de/brokerage/submissions/full',
    #         data=json.dumps(FullWorkflowTest.content),
    #         headers={
    #             'Authorization': 'Token 95bf481b2262df60953c31604a585450445880af',
    #             'Content-Type': 'application/json'}
    #     )

    # @skip('test against c103-171.cloud.gwdg.de (docker)')
    # def test_post_to_gwdg_docker_server(self):
    #     response = requests.post(
    #         url='https://c103-171.cloud.gwdg.de/brokerage/submissions/full',
    #         data=json.dumps(FullWorkflowTest.content),
    #         headers={
    #             'Authorization': 'Token 8b63a9874f6188bf65987a56dd5b6ab5da7ec23a',
    #             'Content-Type': 'application/json'}
    #     )

    # @skip('test against services.gfbio.org (docker)')
    # def test_post_to_gwdg_docker_server_2(self):
    #     response = requests.post(
    #         url='https://https://services.gfbio.org/api/submissions/',
    #         data=json.dumps(FullWorkflowTest.content),
    #         headers={
    #             'Authorization': 'Token f411f893264e2fe3c153a8998fe2c9c75944cb89',
    #             'Content-Type': 'application/json'}
    #     )

    # --------------------------------------------------------------------------

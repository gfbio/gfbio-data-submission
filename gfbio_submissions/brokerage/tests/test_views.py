# -*- coding: utf-8 -*-
import base64
import json
from pprint import pprint
from uuid import UUID

import responses
from django.contrib.auth.models import Permission
from django.test import TestCase
from rest_framework.test import APIRequestFactory, APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL
from gfbio_submissions.brokerage.models import Submission, RequestLog, \
    SiteConfiguration, ResourceCredential
from gfbio_submissions.brokerage.tests.utils import \
    _get_submission_request_data, _get_submission_post_response
from gfbio_submissions.users.models import User


class TestAddSubmissionView(TestCase):

    # 1. force auth, permission set in setUpClass. working
    # request = self.factory.post('/api/submissions/', data={}, format='json')
    # force_authenticate(request, user=self.user)
    # response = SubmissionsView.as_view()(request)
    # # print(response.data)
    # response.render()
    # print(response)
    # print(response.content)

    # 2. request using dfr api client, auth explictly. override self.client ?
    # client = APIClient()
    # client.credentials(HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
    #     b'horst:password').decode('utf-8'))
    # response = client.post('/api/submissions/', {}, format='json')
    # print(response)s
    # print(response.content)

    @classmethod
    def setUpTestData(cls):
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            codename__endswith='submission')
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        user.user_permissions.add(*permissions)
        user = User.objects.create_user(
            username='kevin', email='kevin@kevin.de', password='secret')
        user.user_permissions.add(*permissions)
        admin = User.objects.create_superuser(
            username='admin', email='admin@admin.de', password='psst')
        cls.factory = APIRequestFactory()
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        cls.site_config = SiteConfiguration.objects.create(
            title='default',
            release_submissions=False,
            use_gfbio_services=False,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        client = APIClient()
        client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'horst:password').decode('utf-8')
        )
        cls.api_client = client
        other_client = APIClient()
        other_client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode(
                b'kevin:secret').decode('utf-8')
        )
        cls.other_api_client = other_client
        # responses.add(
        #     responses.POST,
        #     '{0}{1}'.format(
        #         cls.site_config.helpdesk_server.url,
        #         HELPDESK_API_SUB_URL
        #     ),
        #     status=200,
        #     body=json.dumps({'mocked_response': True})
        # )

    def _add_create_ticket_response(self):
        responses.add(
            responses.POST,
            '{0}{1}'.format(
                self.site_config.helpdesk_server.url,
                HELPDESK_API_SUB_URL
            ),
            status=200,
            body=json.dumps({'mocked_response': True})
        )

    def _post_submission(self):
        return self.api_client.post(
            '/api/submissions/',
            {'target': 'ENA', 'release': False, 'data': {
                'requirements': {
                    'title': 'A Title',
                    'description': 'A Description'}}},
            format='json'
        )

    # def setUp(self):
    #     # content_type = ContentType.objects.get(app_label='brokerage',
    #     #                                        model='submission')
    #     # permission = Permission.objects.create(codename='add_submission',
    #     #                                        name='Add Submissions',
    #     #                                        content_type=content_type)
    #     # print(Permission.objects.all())
    #     permissions = Permission.objects.filter(
    #         content_type__app_label='brokerage',
    #         codename__endswith='submission')
    #     # for a in permissions:
    #     #     print(a)
    #     # u.user_permissions.add(permission)
    #     self.user = User.objects.create_user(
    #         username='horst', email='horst@horst.de', password='password')
    #     self.user.user_permissions.add(*permissions)
    #
    #     self.factory = APIRequestFactory()

    def test_submissions_get_request(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_empty_min_post(self):
        response = self.api_client.post('/api/submissions/', {}, format='json')
        self.assertEqual(400, response.status_code)
        self.assertEqual(0, len(Submission.objects.all()))

    def test_empty_min_post_errors(self):
        response = self.api_client.post('/api/submissions/', {}, format='json')
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('target', keys)
        self.assertIn('data', keys)

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
            'data': {'optional_validation': [
                "requirements : 'study_type' is a required property",
                "requirements : 'samples' is a required property",
                "requirements : 'experiments' is a required property"],
                'requirements': {'description': 'A Description',
                                 'title': 'A Title'}},
            'embargo': None,
            'download_url': '',
            'release': False,
            'site': 'horst',
            'site_project_id': '',
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
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(0, len(submission.site_project_id))
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(0, len(submission.submitting_user))
        self.assertEqual(0,
                         len(submission.submitting_user_common_information))
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
            'data': {'optional_validation': [
                u"requirements : 'study_type' is a required property",
                u"requirements : 'samples' is a required property",
                u"requirements : 'experiments' is a required property"],
                'requirements': {'description': 'A Description',
                                 'title': 'A Title'}},
            'embargo': None,
            'download_url': '',
            'release': False,
            'site': 'horst',
            'site_project_id': '',
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
        self.assertIn(b'study_type', response.content)
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
        self.assertEqual(201, response.status_code)
        content = json.loads(response.content.decode('utf-8'))
        expected = _get_submission_post_response()
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

    @responses.activate
    def test_get_submissions(self):
        self._add_create_ticket_response()
        self._post_submission()
        response = self.api_client.get('/api/submissions/')
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertEqual(1, len(content))

    @responses.activate
    def test_get_submissions_for_user(self):
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
        response = self.api_client.get(
            '/api/submissions/{0}/'.format(submission.broker_submission_id))
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertEqual('horst', content['site'])

    # def test_no_submission_for_id(self):
    #     VALID_USER, response = self._post_submission()
    #     response = self.client.get(
    #         '/api/submissions/{0}/'.format(
    #             uuid4()),
    #         **VALID_USER
    #     )
    #     self.assertEqual(404, response.status_code)
    #
    # def test_put_submission(self):
    #     VALID_USER, response = self._post_submission()
    #     self.assertEqual(6, len(Submission.objects.all()))
    #     submission = Submission.objects.last()
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'data': {
    #                 'requirements': {
    #                     'title': 'A Title 0815',
    #                     'description': 'A Description 2'}
    #             }
    #         }), **VALID_USER)
    #     content = json.loads(response.content.decode('utf-8'))
    #     self.assertEqual(200, response.status_code)
    #     self.assertTrue(isinstance(content, dict))
    #     self.assertIn('0815', content['data']['requirements']['title'])
    #     self.assertEqual(6, len(Submission.objects.all()))
    #
    # def test_putpost_submission(self):
    #     VALID_USER, response = self._post_submission()
    #     self.assertEqual(6, len(Submission.objects.all()))
    #     submission = Submission.objects.last()
    #     response = self.client.post(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'data': {
    #                 'requirements': {
    #                     'title': 'A Title 0815',
    #                     'description': 'A Description 2'}
    #             }
    #         }), **VALID_USER)
    #     self.assertEqual(405, response.status_code)
    #     self.assertEqual('{"detail":"Method \\"POST\\" not allowed."}',
    #                      response.content.decode('utf-8'))
    #
    # def test_put_submission_min_validation(self):
    #     VALID_USER, response = self._post_submission()
    #     submission = Submission.objects.last()
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'data': {
    #                 'requirements': {
    #                     'title': 'A Title 0815',
    #                     'description': 'A Description 2'}
    #             }
    #         }), **VALID_USER)
    #     content = json.loads(response.content.decode('utf-8'))
    #     submission = Submission.objects.last()
    #     self.assertEqual(Submission.OPEN, submission.status)
    #     self.assertEqual(200, response.status_code)
    #     self.assertIn('optional_validation', content['data'].keys())
    #     self.assertIn('optional_validation', submission.data)
    #
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'data': {
    #                 'requirements': {
    #                 }
    #             }
    #         }), **VALID_USER)
    #     content = json.loads(response.content.decode('utf-8'))
    #     submission = Submission.objects.first()
    #     self.assertEqual(Submission.OPEN, submission.status)
    #     self.assertEqual(400, response.status_code)
    #     self.assertIn('optional_validation', content.keys())
    #
    # def test_put_submission_valid_max_validation(self):
    #     VALID_USER, response = self._post_submission()
    #     submission = Submission.objects.last()
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': True,
    #             'data': self.new_data
    #         }), **VALID_USER)
    #     content = json.loads(response.content.decode('utf-8'))
    #     submission = Submission.objects.last()
    #     self.assertEqual(200, response.status_code)
    #     self.assertFalse('optional_validation' in content['data'].keys())
    #     self.assertFalse('optional_validation' in submission.data)
    #
    #     submission = Submission.objects.last()
    #     self.assertEqual(Submission.SUBMITTED,
    #                      content.get('status', 'NOPE'))
    #     self.assertEqual(Submission.SUBMITTED, submission.status)
    #
    # def test_put_submission_invalid_max_validation(self):
    #     VALID_USER, response = self._post_submission()
    #     submission = Submission.objects.last()
    #     data = copy.deepcopy(self.new_data)
    #     data['requirements'].pop('samples')
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': True,
    #             'data': data
    #         }), **VALID_USER)
    #     content = json.loads(response.content.decode('utf-8'))
    #
    #     self.assertEqual(400, response.status_code)
    #     self.assertIn("'samples' is a required property",
    #                   response.content.decode('utf-8'))
    #     self.assertFalse(
    #         'optional_validation' in response.content.decode('utf-8'))
    #
    #     submission = Submission.objects.last()
    #     self.assertEqual(Submission.OPEN, submission.status)
    #
    # def test_put_submission_max_validation_without_release(self):
    #     VALID_USER, response = self._post_submission()
    #     submission = Submission.objects.last()
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': False,
    #             'data': self.new_data
    #         }), **VALID_USER)
    #     content = json.loads(response.content.decode('utf-8'))
    #     submission = Submission.objects.last()
    #     self.assertEqual(200, response.status_code)
    #     self.assertFalse('optional_validation' in content['data'].keys())
    #     self.assertFalse('optional_validation' in submission.data)
    #     submission = Submission.objects.first()
    #     self.assertEqual(Submission.OPEN,
    #                      content.get('status', 'NOPE'))
    #     self.assertEqual(Submission.OPEN, submission.status)
    #
    # def test_put_on_submitted_submission(self):
    #     VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
    #         b'horst:password').decode('utf-8')}
    #     submission = Submission.objects.get(
    #         broker_submission_id=UUID(
    #             'e931072e-61c2-42e4-923a-39b6ab255a9f'))
    #     self.assertEqual(Submission.SUBMITTED, submission.status)
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': False,
    #             'data': self.new_data
    #         }), **VALID_USER)
    #     self.assertTrue(400, response.status_code)
    #     content = response.content.decode('utf-8')
    #     self.assertIn('"status":"SUBMITTED"', content)
    #     self.assertIn(
    #         '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
    #         content)
    #     self.assertIn(
    #         '"error":"no modifications allowed with current status"',
    #         content)
    #
    # def test_put_on_cancelled_submission(self):
    #     VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
    #         b'horst:password').decode('utf-8')}
    #     submission = Submission.objects.get(
    #         broker_submission_id=UUID(
    #             'e931072e-61c2-42e4-923a-39b6ab255a9f'))
    #     submission.status = Submission.CANCELLED
    #     submission.save()
    #     self.assertEqual(Submission.CANCELLED, submission.status)
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': False,
    #             'data': self.new_data
    #         }), **VALID_USER)
    #     self.assertTrue(400, response.status_code)
    #     content = response.content.decode('utf-8')
    #     self.assertIn('"status":"CANCELLED"', content)
    #     self.assertIn(
    #         '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
    #         content)
    #     self.assertIn(
    #         '"error":"no modifications allowed with current status"',
    #         content)
    #
    # def test_put_on_error_submission(self):
    #     VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
    #         b'horst:password').decode('utf-8')}
    #     submission = Submission.objects.get(
    #         broker_submission_id=UUID(
    #             'e931072e-61c2-42e4-923a-39b6ab255a9f'))
    #     submission.status = Submission.ERROR
    #     submission.save()
    #     self.assertEqual(Submission.ERROR, submission.status)
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': False,
    #             'data': self.new_data
    #         }), **VALID_USER)
    #     self.assertTrue(400, response.status_code)
    #     content = response.content.decode('utf-8')
    #     self.assertIn('"status":"ERROR"', content)
    #     self.assertIn(
    #         '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
    #         content)
    #     self.assertIn(
    #         '"error":"no modifications allowed with current status"',
    #         content)
    #
    # def test_put_on_closed_submission(self):
    #     VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
    #         b'horst:password').decode('utf-8')}
    #     submission = Submission.objects.get(
    #         broker_submission_id=UUID(
    #             'e931072e-61c2-42e4-923a-39b6ab255a9f'))
    #     submission.status = Submission.CLOSED
    #     submission.save()
    #     self.assertEqual(Submission.CLOSED, submission.status)
    #     response = self.client.put(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'release': False,
    #             'data': self.new_data
    #         }), **VALID_USER)
    #     self.assertTrue(400, response.status_code)
    #     content = response.content.decode('utf-8')
    #     self.assertIn('"status":"CLOSED"', content)
    #     self.assertIn(
    #         '"error":"no modifications allowed with current status"',
    #         content)
    #     self.assertIn(
    #         '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
    #         content)
    #
    # def test_post_on_submission_detail_view(self):
    #     VALID_USER, response = self._post_submission()
    #     submission = Submission.objects.first()
    #     response = self.client.post(
    #         '/api/submissions/{}/'.format(submission.pk),
    #         content_type='application/json',
    #         data=json.dumps({
    #             'target': 'ENA',
    #             'data': {
    #                 'requirements': {
    #                     'title': 'A Title 0815',
    #                     'description': 'A Description 2'}
    #             }
    #         }), **VALID_USER)
    #     self.assertEqual(405, response.status_code)
    #
    # def test_delete_submission(self):
    #     VALID_USER, response = self._post_submission()
    #     self.assertEqual(6, len(Submission.objects.all()))
    #
    #     submission = Submission.objects.last()
    #     response = self.client.delete(
    #         '/api/submissions/{0}/'.format(
    #             submission.broker_submission_id),
    #         **VALID_USER
    #     )
    #
    #     self.assertEqual(204, response.status_code)
    #     self.assertEqual(6, len(Submission.objects.all()))
    #     sub = Submission.objects.last()
    #     self.assertEqual(Submission.CANCELLED, sub.status)
    #     submission = Submission.objects.last()
    #     self.assertEqual(Submission.CANCELLED, submission.status)
    #
    # def test_patch_submission(self):
    #     VALID_USER, response = self._post_submission()
    #     response = self.client.patch('/api/submissions/1/',
    #                                  content_type='application/json',
    #                                  data=json.dumps({
    #                                      'target': 'ENA_PANGAEA'
    #                                  }), **VALID_USER)
    #     self.assertEqual(405, response.status_code)
    #
    # def test_no_credentials(self):
    #     response = self.client.post('/api/submissions/')
    #     self.assertEqual(401, response.status_code)
    #
    # def test_get_no_credentials(self):
    #     response = self.client.get('/api/submissions/')
    #     self.assertEqual(401, response.status_code)
    #
    # def test_get_submission_no_credentials(self):
    #     response = self.client.get('/api/submissions/{0}/'.format(uuid4()))
    #     self.assertEqual(401, response.status_code)
    #
    # def test_get_with_credentials(self):
    #     VALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'horst:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.get('/api/submissions/', **VALID_USER)
    #     self.assertEqual(200, response.status_code)
    #
    # def test_invalid_basic_auth(self):
    #     INVALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'horst:WRONG').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/',
    #                                 {"some": "data"},
    #                                 **INVALID_USER)
    #     self.assertEqual(401, response.status_code)
    #
    # def test_detail_invalid_basic_auth(self):
    #     INVALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'horst:WRONG').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.get('/api/submissions/{0}/'.format(uuid4()),
    #                                **INVALID_USER)
    #     self.assertEqual(401, response.status_code)
    #
    # def test_valid_basic_auth(self):
    #     VALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'horst:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/',
    #                                 {"some": "data"},
    #                                 **VALID_USER)
    #     self.assertNotEqual(401, response.status_code)
    #     self.assertEqual(400, response.status_code)
    #
    # def test_super_user(self):
    #     VALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'noob:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/', **VALID_USER)
    #
    #     self.assertNotEqual(401, response.status_code)
    #     self.assertEqual(400, response.status_code)
    #
    # def test_staff_user(self):
    #     VALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(
    #                 b'test_checker:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/', **VALID_USER)
    #     self.assertNotEqual(401, response.status_code)
    #     self.assertEqual(400, response.status_code)
    #
    # def test_active_user(self):
    #     VALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'horst:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/', **VALID_USER)
    #     self.assertNotEqual(401, response.status_code)
    #     self.assertEqual(400, response.status_code)
    #
    # def test_inactive_user(self):
    #     INVALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'sonOfNoob:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/',
    #                                 **INVALID_USER)
    #     self.assertEqual(401, response.status_code)
    #
    # def test_active_user_without_permissions(self):
    #     INVALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Basic %s' % base64.b64encode(b'nobody:password').decode(
    #                 'utf-8')
    #     }
    #     response = self.client.post('/api/submissions/',
    #                                 **INVALID_USER)
    #     self.assertEqual(403, response.status_code)
    #
    # def test_invalid_token_authentication(self):
    #     INVALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Token %s' % 'afafff4f3f3f77faff2f71f'
    #     }
    #     response = self.client.post('/api/submissions/',
    #                                 {"some": "data"},
    #                                 **INVALID_USER)
    #     self.assertEqual(401, response.status_code)
    #
    # def test_valid_token_authentication(self):
    #     token = Token.objects.create(
    #         user=User.objects.get(username='horst'))
    #     VALID_USER = {
    #         'HTTP_AUTHORIZATION':
    #             'Token %s' % token.key
    #     }
    #     response = self.client.post('/api/submissions/',
    #                                 {
    #                                     'site_project_id': 'p1',
    #                                     'submitting_user': 'johnDoe',
    #                                     'site_object_id': 'o1',
    #                                     'study': '{}'
    #                                 },
    #                                 **VALID_USER)
    #     self.assertNotEqual(401, response.status_code)
    #     self.assertEqual(400, response.status_code)

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

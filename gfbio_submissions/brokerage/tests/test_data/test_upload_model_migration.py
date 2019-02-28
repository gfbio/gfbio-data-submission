# -*- coding: utf-8 -*-

import responses
from django.contrib.auth.models import Permission
from django.core.urlresolvers import reverse
from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, HELPDESK_ATTACHMENT_SUB_URL
from gfbio_submissions.brokerage.management.commands import \
    migrate_upload_models
from gfbio_submissions.brokerage.models import SubmissionFileUpload, Submission, \
    SiteConfiguration, ResourceCredential, AdditionalReference, PrimaryDataFile, \
    SubmissionUpload
from gfbio_submissions.brokerage.tests.test_models import SubmissionTest
from gfbio_submissions.brokerage.tests.utils import _get_jira_attach_response
from gfbio_submissions.users.models import User


class TestUploadModelMigration(TestCase):

    @staticmethod
    def _delete_test_data():
        SubmissionFileUpload.objects.all().delete()
        SubmissionUpload.objects.all().delete()
        PrimaryDataFile.objects.all().delete()

    @classmethod
    def _create_test_data(cls, path, primary=False):
        # cls._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        if primary:
            return {
                'data_file': f,
            }
        else:
            return {
                'file': f,
            }

    @classmethod
    @responses.activate
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        permissions = Permission.objects.filter(
            content_type__app_label='brokerage'
        )
        user.user_permissions.add(*permissions)
        token = Token.objects.create(user=user)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        cls.api_client = client
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
        # ----------------------------------------------------------------------
        submission_a = SubmissionTest._create_submission_via_serializer()
        # ----------------------------------------------------------------------
        submission_b = SubmissionTest._create_submission_via_serializer()
        submission_b.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': submission_b.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          cls.site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = cls._create_test_data('/tmp/test_primary_data_file_b',
                                     primary=True)
        response = cls.api_client.post(url, data, format='multipart')
        # ----------------------------------------------------------------------
        submission_c = SubmissionTest._create_submission_via_serializer()
        submission_c.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        for i in range(0, 3):
            url = reverse(
                'brokerage:submissions_upload',
                kwargs={
                    'broker_submission_id': submission_c.broker_submission_id
                })
            data = cls._create_test_data('/tmp/test_upload_{0}'.format(i))
            cls.api_client.post(url, data, format='multipart')
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': submission_c.broker_submission_id})
        responses.add(responses.POST, url, json={}, status=200)
        responses.add(responses.POST,
                      '{0}{1}/{2}/{3}'.format(
                          cls.site_config.helpdesk_server.url,
                          HELPDESK_API_SUB_URL,
                          'FAKE_KEY',
                          HELPDESK_ATTACHMENT_SUB_URL,
                      ),
                      json=_get_jira_attach_response(),
                      status=200)
        data = cls._create_test_data('/tmp/test_primary_data_file_c',
                                     primary=True)
        cls.api_client.post(url, data, format='multipart')
        # ----------------------------------------------------------------------
        submission_d = SubmissionTest._create_submission_via_serializer()
        url = reverse(
            'brokerage:submissions_upload',
            kwargs={
                'broker_submission_id': submission_d.broker_submission_id
            })
        data = cls._create_test_data('/tmp/test_upload_d')
        cls.api_client.post(url, data, format='multipart')
        # ----------------------------------------------------------------------
        cls.submission_pks = [submission_a.pk, submission_b.pk, submission_c.pk,
                              submission_d.pk]

    def test_db_content(self):
        sub_a = Submission.objects.get(pk=1)
        self.assertEqual(0, len(sub_a.submissionfileupload_set.all()))
        self.assertEqual(0, len(sub_a.primarydatafile_set.all()))
        self.assertEqual(0, len(sub_a.submissionupload_set.all()))
        sub_b = Submission.objects.get(pk=2)
        self.assertEqual(0, len(sub_b.submissionfileupload_set.all()))
        self.assertEqual(1, len(sub_b.primarydatafile_set.all()))
        self.assertEqual(0, len(sub_a.submissionupload_set.all()))
        sub_c = Submission.objects.get(pk=3)
        self.assertEqual(3, len(sub_c.submissionfileupload_set.all()))
        self.assertEqual(1, len(sub_c.primarydatafile_set.all()))
        self.assertEqual(0, len(sub_a.submissionupload_set.all()))
        sub_d = Submission.objects.get(pk=4)
        self.assertEqual(1, len(sub_d.submissionfileupload_set.all()))
        self.assertEqual(0, len(sub_d.primarydatafile_set.all()))
        self.assertEqual(0, len(sub_a.submissionupload_set.all()))

    def test_management_command_method(self):
        migrate_upload_models.Command.migrate_upload_models()
        sub_a = Submission.objects.get(pk=1)
        self.assertEqual(0, len(sub_a.submissionfileupload_set.all()))
        self.assertEqual(0, len(sub_a.primarydatafile_set.all()))
        self.assertEqual(0, len(sub_a.submissionupload_set.all()))
        sub_b = Submission.objects.get(pk=2)
        self.assertEqual(0, len(sub_b.submissionfileupload_set.all()))
        self.assertEqual(1, len(sub_b.primarydatafile_set.all()))
        self.assertEqual(1, len(sub_b.submissionupload_set.all()))
        sub_c = Submission.objects.get(pk=3)
        self.assertEqual(3, len(sub_c.submissionfileupload_set.all()))
        self.assertEqual(1, len(sub_c.primarydatafile_set.all()))
        self.assertEqual(4, len(sub_c.submissionupload_set.all()))
        sub_d = Submission.objects.get(pk=4)
        self.assertEqual(1, len(sub_d.submissionfileupload_set.all()))
        self.assertEqual(0, len(sub_d.primarydatafile_set.all()))
        self.assertEqual(1, len(sub_d.submissionupload_set.all()))

        for a in PrimaryDataFile.objects.all():
            self.assertTrue(a.migrated)
        for a in SubmissionFileUpload.objects.all():
            self.assertTrue(a.migrated)

        for s in SubmissionUpload.objects.all():
            self.assertGreater(len(s.file.read()), 0)

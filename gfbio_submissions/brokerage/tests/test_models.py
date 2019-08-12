# -*- coding: utf-8 -*-
import uuid

import responses
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from unittest.mock import patch

from gfbio_submissions.brokerage.admin import download_auditable_text_data
from gfbio_submissions.brokerage.models import ResourceCredential, \
    SiteConfiguration, TicketLabel, BrokerObject, CenterName, Submission, \
    PersistentIdentifier, RequestLog, AdditionalReference, AuditableTextData, \
    TaskProgressReport, SubmissionUpload
from gfbio_submissions.brokerage.serializers import SubmissionSerializer
from gfbio_submissions.brokerage.tests.utils import _get_ena_data_without_runs, \
    _get_ena_data, _get_ena_xml_response
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data, \
    send_submission_to_ena, store_ena_data_as_auditable_text_data
from gfbio_submissions.users.models import User


class ResourceCredentialTest(TestCase):

    def setUp(self):
        ResourceCredential.objects.get_or_create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

    def test_db(self):
        resource_credentials = ResourceCredential.objects.all()
        self.assertEqual(1, len(resource_credentials))

    def test_str(self):
        resource_credentials = ResourceCredential.objects.all()
        self.assertEqual(
            'Resource Title',
            resource_credentials.first().__str__()
        )


class SiteConfigurationTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1'
        )
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        site_conf = SiteConfiguration.objects.create(
            title='Title',
            site=user,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        SiteConfiguration.objects.create(
            title='Default',
            site=None,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )
        TicketLabel.objects.create(
            site_configuration=site_conf,
            label_type='P',
            label='label_1'
        )
        TicketLabel.objects.create(
            site_configuration=site_conf,
            label_type='G',
            label='label_2'
        )
        TicketLabel.objects.create(
            site_configuration=site_conf,
            label_type='P',
            label='label_3'
        )

    def test_db(self):
        site_configurations = SiteConfiguration.objects.all()
        self.assertEqual(2, len(site_configurations))

    def test_instance(self):
        site_config = SiteConfiguration.objects.all().first()
        self.assertIsInstance(site_config, SiteConfiguration)
        self.assertIsInstance(site_config.site, User)
        self.assertIsInstance(site_config.ena_server, ResourceCredential)
        self.assertIsInstance(site_config.pangaea_server, ResourceCredential)
        self.assertIsInstance(site_config.gfbio_server, ResourceCredential)
        self.assertIsInstance(site_config.helpdesk_server, ResourceCredential)
        self.assertFalse(site_config.release_submissions)

    def test_str(self):
        site_config = SiteConfiguration.objects.all().first()
        self.assertEqual('Title', site_config.__str__())

    def test_get_site_configuration_for_task(self):
        site_config = SiteConfiguration.objects.get_site_configuration_for_task(
            site=User.objects.all().first()
        )
        self.assertEqual('Title', site_config.title)
        self.assertFalse(site_config.release_submissions)

    def test_get_site_configuration_without_site(self):
        site_config = SiteConfiguration.objects.get_site_configuration_for_task(
            site=None
        )
        self.assertEqual('Default', site_config.title)
        self.assertFalse(site_config.release_submissions)
        self.assertIsNone(site_config.site)

    def test_get_site_configuration_without_site_or_default(self):
        site_config = SiteConfiguration.objects.filter(title='Default').first()
        site_config.delete()
        with self.assertRaises(SiteConfiguration.DoesNotExist) as exc:
            site_config = SiteConfiguration.objects.get_site_configuration_for_task(
                site=None
            )

    def test_get_ticket_labels(self):
        site_config = SiteConfiguration.objects.all().first()
        labels = site_config.get_ticket_labels(
            label_type=TicketLabel.PANGAEA_JIRA)
        self.assertEqual(2, len(labels))
        self.assertTrue(isinstance(labels, list))
        for l in labels:
            self.assertTrue(isinstance(l, str))


class TicketLabelTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1'
        )
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        SiteConfiguration.objects.create(
            title='Title',
            site=user,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Comment',
        )
        SiteConfiguration.objects.create(
            title='Default',
            site=None,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )

    def test_instance(self):
        labels = TicketLabel.objects.all()
        self.assertEqual(0, len(labels))
        TicketLabel.objects.create(
            site_configuration=SiteConfiguration.objects.first(),
            label_type='P',
            label='label this!'
        )
        labels = TicketLabel.objects.all()
        self.assertEqual(1, len(labels))

    def test_site_configuration_labels(self):
        site_config = SiteConfiguration.objects.first()
        TicketLabel.objects.create(
            site_configuration=SiteConfiguration.objects.first(),
            label_type='P',
            label='label this!'
        )
        self.assertEqual(1, len(site_config.ticketlabel_set.all()))
        other_site_config = SiteConfiguration.objects.last()
        self.assertEqual(0, len(other_site_config.ticketlabel_set.all()))


class BrokerObjectTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1'
        )
        BrokerObject.objects.create(
            type='study',
            site=user,
            site_project_id='prj001xxx',
            site_object_id='obj001',
            data={
                'center_name': 'GFBIO',
                'study_type': 'Metagenomics',
                'study_abstract': 'abstract',
                'study_title': 'title',
                'study_alias': 'alias',
                'site_object_id': 'from_data_01'
            }
        )

    def test_instance(self):
        se = BrokerObject()
        self.assertTrue(isinstance(se, BrokerObject))

    def test_str(self):
        broker_object = BrokerObject.objects.first()
        self.assertEqual('obj001_study', broker_object.__str__())


class CenterNameTest(TestCase):

    def test_instance(self):
        cn = CenterName()
        cn.center_name = 'A Center'
        cn.save()
        self.assertEqual('A Center', cn.center_name)
        self.assertEqual(1, len(CenterName.objects.all()))

    def test_default_name(self):
        cn = CenterName()
        self.assertEqual('', cn.center_name)

    def test_str(self):
        cn, created = CenterName.objects.get_or_create(center_name='ABC')
        self.assertEqual('ABC', cn.__str__())


class SubmissionTest(TestCase):

    @classmethod
    def _create_submission_via_serializer(cls, runs=False):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': _get_ena_data() if runs else _get_ena_data_without_runs()
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def setUpTestData(cls):
        cls.data = _get_ena_data_without_runs()
        user = User.objects.create(
            username='user1'
        )
        Submission.objects.create(site=user)

    def test_str(self):
        submission = Submission.objects.first()
        self.assertEqual(
            '{0}_{1}'.format(submission.pk, submission.broker_submission_id),
            submission.__str__()
        )

    def test_create_empty_submission(self):
        submission = Submission()
        submission.site = User.objects.first()
        submission.save()
        submissions = Submission.objects.all()
        self.assertEqual(2, len(submissions))

    def test_center_name_is_none(self):
        submission = Submission.objects.first()
        self.assertIsNone(submission.center_name)

    def test_center_name(self):
        center_name, created = CenterName.objects.get_or_create(
            center_name='ABCD')
        sub = Submission.objects.first()
        sub.center_name = center_name
        sub.save()
        self.assertEqual(center_name, sub.center_name)
        self.assertEqual('ABCD', sub.center_name.center_name)

    def test_ids_on_empty_submission(self):
        submissions = Submission.objects.all()
        submission_count = len(submissions)
        submission = Submission()
        pre_save_bsi = submission.broker_submission_id
        submission.save()
        self.assertEqual(pre_save_bsi, submission.broker_submission_id)
        self.assertEqual(submission.pk, submission.id)
        submissions = Submission.objects.all()
        post_save_count = len(submissions)
        self.assertEqual(post_save_count, submission_count + 1)

    def test_get_study_json(self):
        submission = self._create_submission_via_serializer()
        ena_study = {
            'study_title': self.data.get('requirements')[
                'title'],
            'study_abstract': self.data.get('requirements')[
                'description'],
            'study_type': self.data.get('requirements')[
                'study_type']
        }
        self.assertDictEqual(ena_study, submission.get_study_json())

    def test_get_sample_json(self):
        submission = self._create_submission_via_serializer()
        content_samples = self.data.get('requirements').get('samples')
        for s in submission.get_sample_json().get('samples'):
            self.assertIn(s, content_samples)

    def test_get_experiment_json_with_files(self):
        submission = self._create_submission_via_serializer()
        content_experiments = self.data.get('requirements').get('experiments')
        for s in submission.get_experiment_json().get('experiments'):
            self.assertIn(s, content_experiments)
            self.assertTrue('files' in s.keys())

    def test_get_experiment_json_with_files_and_run(self):
        json_data = _get_ena_data()
        submission = self._create_submission_via_serializer(runs=True)
        content_experiments = json_data.get('requirements').get('experiments')
        for s in submission.get_experiment_json().get('experiments'):
            self.assertIn(s, content_experiments)
            if s['experiment_alias'] == 'experiment_no_file_block':
                self.assertFalse('files' in s.keys())
            else:
                self.assertTrue('files' in s.keys())

    def test_get_run_json_with_files_in_experiment(self):
        submission = self._create_submission_via_serializer()
        # 1x files in experiments. 0x run.
        self.assertEqual(1, len(submission.get_run_json().get('runs')))

    def test_get_run_json_with_additional_files_in_experiment(self):
        submission = self._create_submission_via_serializer(runs=True)
        # 4x files in experiments. 2x run.
        self.assertEqual(6, len(submission.get_run_json().get('runs')))

    def test_get_json_with_aliases_with_file_in_experiment(self):
        submission = self._create_submission_via_serializer()
        request_id_fake = uuid.UUID('71d59109-695d-4172-a8be-df6fb3283857')
        study, samples, experiments, runs = submission.get_json_with_aliases(
            alias_postfix=request_id_fake)
        study_alias = study.get('study_alias', None)
        sample_aliases = [s.get('sample_alias', '') for s in samples]
        experiment_aliases = [
            e.get('experiment_alias', '') for e in experiments
        ]
        experiment_sample_descriptors = [
            e.get('design', {}).get('sample_descriptor', '')
            for e in experiments
        ]
        experiment_study_refs = [e.get('study_ref', '') for e in experiments]
        run_experiment_refs = [r.get('experiment_ref') for r in runs]

        for e in experiment_sample_descriptors:
            self.assertIn(e, sample_aliases)
            self.assertTrue(2, len(e.split(':')))
        for e in experiment_study_refs:
            self.assertEqual(e, study_alias)
            self.assertTrue(2, len(e.split(':')))
        self.assertEqual(1, len(experiment_aliases))
        self.assertEqual(1, len(run_experiment_refs))

    def test_get_json_with_aliases_with_additional_files_in_experiment(self):
        submission = self._create_submission_via_serializer(runs=True)
        request_id_fake = uuid.UUID('71d59109-695d-4172-a8be-df6fb3283857')
        study, samples, experiments, runs = submission.get_json_with_aliases(
            alias_postfix=request_id_fake)
        study_alias = study.get('study_alias', None)
        sample_aliases = [s.get('sample_alias', '') for s in samples]
        experiment_aliases = [
            e.get('experiment_alias', '')
            for e in experiments
        ]
        experiment_sample_descriptors = [
            e.get('design', {}).get('sample_descriptor', '')
            for e in experiments
        ]
        experiment_study_refs = [e.get('study_ref', '') for e in experiments]
        run_experiment_refs = [r.get('experiment_ref') for r in runs]

        for e in experiment_sample_descriptors:
            self.assertIn(e, sample_aliases)
            self.assertTrue(2, len(e.split(':')))
        for e in experiment_study_refs:
            self.assertEqual(e, study_alias)
            self.assertTrue(2, len(e.split(':')))
        self.assertEqual(5, len(experiment_aliases))
        self.assertEqual(6, len(run_experiment_refs))
        for r in run_experiment_refs:
            self.assertIn(r, experiment_aliases)
            self.assertTrue(2, len(r.split(':')))

    def test_queuing_of_closed_submissions(self):
        with patch('gfbio_submissions.brokerage.tasks.'
                   'trigger_submission_transfer.apply_async') as trigger_mock:
            sub = Submission()
            sub.site = User.objects.first()
            sub.status = Submission.CLOSED
            sub.save()
            self.assertEqual(Submission.CLOSED, sub.status)
            trigger_mock.assert_not_called()


class PersistentIdentifierTest(TestCase):

    def setUp(self):
        user = User.objects.create(
            username='user1'
        )
        broker_object = BrokerObject.objects.create(
            type='study',
            site=user,
            site_project_id='prj001xxx',
            site_object_id='obj001',
            data={
                'center_name': 'GFBIO',
                'study_type': 'Metagenomics',
                'study_abstract': 'abstract',
                'study_title': 'title',
                'study_alias': 'alias',
                'site_object_id': 'from_data_01'
            }
        )
        PersistentIdentifier.objects.get_or_create(
            archive='ENA',
            pid_type='ACC',
            broker_object=broker_object,
            pid='ACC_1234',
            outgoing_request_id='da76ebec-7cde-4f11-a7bd-35ef8ebe5b85'
        )

    def test_str(self):
        p = PersistentIdentifier.objects.all().first()
        self.assertEqual('ACC_1234', p.__str__())


class RequestLogTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create(
            username='user1'
        )
        SubmissionTest._create_submission_via_serializer()
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )

        SiteConfiguration.objects.create(
            title='Default',
            site=None,
            ena_server=resource_cred,
            pangaea_server=resource_cred,
            gfbio_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
        )

    def tearDown(self):
        Submission.objects.all().delete()

    def test_create_request_log(self):
        submission = Submission.objects.first()
        RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data='{"some_data": 12345}',
            site_user='jdoe',
            submission_id=submission.broker_submission_id,
            response_status=200,
            response_content='Whatever we return',
        )
        self.assertEqual(1, len(RequestLog.objects.all()))

    def test_str(self):
        submission = Submission.objects.first()
        request_log = RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data='{"some_data": 12345}',
            site_user='jdoe',
            submission_id=submission.broker_submission_id,
            response_status=200,
            response_content='Whatever we return',
        )
        self.assertEqual(str(request_log.request_id), request_log.__str__())

    @responses.activate
    def test_send_site_user_type(self):
        submission = Submission.objects.first()
        submission.submitting_user = '666'
        submission.save()
        conf = SiteConfiguration.objects.first()
        responses.add(
            responses.POST,
            conf.ena_server.url,
            status=200,
            body=_get_ena_xml_response()
        )

        ena_submission_data = prepare_ena_data(
            submission=submission)
        response, req_log_request_id = send_submission_to_ena(
            submission=submission,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )

        request_log = RequestLog.objects.get(
            request_id=req_log_request_id)
        self.assertEqual(submission.submitting_user, request_log.site_user)
        self.assertFalse(isinstance(request_log.site_user, tuple))


class AdditionalReferenceTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username='user1'
        )
        submission_1 = Submission.objects.create(site=user)
        submission_2 = Submission.objects.create(site=user)
        AdditionalReference.objects.create(
            submission=submission_1,
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PDI-0815',
            primary=True
        )
        AdditionalReference.objects.create(
            submission=submission_1,
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PDI-0817',
        )
        AdditionalReference.objects.create(
            submission=submission_1,
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='SND-0815',
        )
        AdditionalReference.objects.create(
            submission=submission_2,
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='PDI-0816',
        )

    def test_instance(self):
        reference = AdditionalReference(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            submission=Submission.objects.first()
        )
        reference.save()
        self.assertFalse(reference.primary)
        self.assertTrue(isinstance(reference, AdditionalReference))

    def test_save_primary(self):
        submission = Submission.objects.first()
        submission_references = submission.additionalreference_set.all()
        self.assertEqual(3, len(submission_references))
        for ref in submission_references:
            if ref.pk == 1:
                self.assertTrue(ref.primary)
            else:
                self.assertFalse(ref.primary)

        pangeae_references = submission.additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET)
        self.assertEqual(2, len(pangeae_references))
        ref = pangeae_references.first()
        ref.primary = True
        ref.save()
        reference_changed = ref.reference_key

        pangeae_references = submission.additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET)
        primary_references = pangeae_references.filter(primary=True)
        self.assertEqual(1, len(primary_references))
        self.assertEqual(reference_changed,
                         primary_references.first().reference_key)
        non_primary = pangeae_references.filter(primary=False)
        self.assertEqual(1, len(non_primary))
        self.assertNotEqual(reference_changed,
                            non_primary.first().reference_key)

        ref = non_primary.first()
        reference_changed = ref.reference_key
        ref.primary = True
        ref.save()

        pangeae_references = submission.additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET)
        primary_references = pangeae_references.filter(primary=True)
        self.assertEqual(1, len(primary_references))
        self.assertEqual(reference_changed,
                         primary_references.first().reference_key)
        non_primary = pangeae_references.filter(primary=False)
        self.assertEqual(1, len(non_primary))
        self.assertNotEqual(reference_changed,
                            non_primary.first().reference_key)


class TestAuditableTextData(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password')
        submission = SubmissionTest._create_submission_via_serializer()

    def test_instance(self):
        submission = Submission.objects.first()
        atd = AuditableTextData.objects.create(
            name='test-file',
            submission=submission
        )
        self.assertFalse(atd.pk is None)
        self.assertIsInstance(atd, AuditableTextData)

    def test_store_ena_data_as_auditable_text_data(self):
        submission = Submission.objects.first()
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(all_text_data))
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(all_text_data))
        text_data_for_submission = AuditableTextData.objects.filter(
            submission=submission)
        self.assertEqual(4, len(text_data_for_submission))

    def test_admin_download(self):
        submission = Submission.objects.first()
        data = prepare_ena_data(submission)
        store_ena_data_as_auditable_text_data(submission, data)
        data = AuditableTextData.objects.filter(submission=submission)
        response = download_auditable_text_data(
            None,
            None,
            Submission.objects.filter(
                broker_submission_id=submission.broker_submission_id)
        )
        self.assertEqual(200, response.status_code)


class TestTaskProgressReport(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username="user1"
        )
        Submission.objects.create(site=user)

    def test_instance(self):
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        submission = Submission.objects.first()
        tpr = TaskProgressReport.objects.create(
            submission=submission,
            task_name='foo',
        )
        tpr.save()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))

    def test_str(self):
        tpr = TaskProgressReport.objects.create(
            submission=Submission.objects.first(),
            task_name='foo',
        )
        tpr.save()
        self.assertEqual('foo', tpr.__str__())
        self.assertIsInstance(tpr.__str__(), str)


class TestSubmissionUpload(TestCase):
    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username="user1"
        )
        Submission.objects.create(site=user)

    def test_instance(self):
        self.assertEqual(0, len(SubmissionUpload.objects.all()))
        submission_upload = SubmissionUpload.objects.create(
            submission=Submission.objects.first(),
            site=User.objects.first(),
            user=User.objects.first(),
            file=SimpleUploadedFile('test_submission_upload.txt',
                                    b'these are the file contents!'),
        )
        self.assertEqual(1, len(SubmissionUpload.objects.all()))

    def test_str(self):
        submission_upload = SubmissionUpload.objects.create(
            submission=Submission.objects.first(),
            site=User.objects.first(),
            user=User.objects.first(),
            file=SimpleUploadedFile('test_submission_upload.txt',
                                    b'these are the file contents!'),
        )
        self.assertIn('.txt / {0}'.format(
            Submission.objects.first().broker_submission_id),
                         submission_upload.__str__())

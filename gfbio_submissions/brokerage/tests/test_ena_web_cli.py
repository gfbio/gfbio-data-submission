# -*- coding: utf-8 -*-
import gzip
import os
from pprint import pprint
from unittest import skip
from uuid import uuid4, UUID

import responses
from django.conf import settings
from django.core.files import File
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils.encoding import smart_str

from gfbio_submissions.brokerage.configuration.settings import ENA, \
    SUBMISSION_DELAY
from gfbio_submissions.brokerage.models import Submission, SubmissionUpload, \
    BrokerObject, CenterName, PersistentIdentifier, AuditableTextData, \
    TaskProgressReport
from gfbio_submissions.brokerage.tasks import \
    create_study_broker_objects_only_task, prepare_ena_study_xml_task, \
    register_study_at_ena_task, process_ena_response_task, \
    create_targeted_sequence_ena_manifest_task, \
    submit_targeted_sequences_to_ena_task, \
    process_targeted_sequence_results_task
from gfbio_submissions.brokerage.tests.utils import _get_ena_data, \
    _get_ena_register_study_response, _get_test_data_dir_path
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data, Enalizer, \
    parse_ena_submission_response, prepare_study_data_only, \
    store_single_data_item_as_auditable_text_data
from gfbio_submissions.brokerage.utils.ena_cli import submit_targeted_sequences, \
    create_ena_manifest_text_data, store_manifest_to_filesystem
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential, RequestLog
from gfbio_submissions.generic.utils import logged_requests
from gfbio_submissions.users.models import User


class TestTargetedSequencePreparationTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        ena_resource_cred = ResourceCredential.objects.create(
            title='Ena testserver access',
            url='https://www-test.ebi.ac.uk/ena/submit/drop-box/submit/',
            authentication_string='',
            # compare devserver
            username='',
            password=''
        )
        cls.site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=ena_resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        user = User.objects.create(
            username="user1"
        )
        user.update_or_create_external_user_id('0815', 'goe_id')
        user.name = 'Kevin Horstmeier'
        user.email = 'khors@me.de'
        user.site_configuration = cls.site_config
        user.save()
        cls.user = user
        center = CenterName.objects.create(center_name="test-center")
        cls.center = center
        min_submission = Submission.objects.create(
            broker_submission_id=UUID(
                '4e5c7fb2-fb9f-447f-92db-33a5f99cba8e'),
            user=user,
            center_name=center,
            target=ENA,
            release=True,
            data={
                "requirements": {
                    "title": "Simple ENA Data",
                    "description": "Reduced Data for testing", }
            }
        )

    def test_initial_db_content(self):
        self.assertEqual(1, len(Submission.objects.all()))
        self.assertEqual(0, len(BrokerObject.objects.all()))
        self.assertEqual(0, len(PersistentIdentifier.objects.all()))
        self.assertEqual(0, len(AuditableTextData.objects.all()))

    def test_create_study_broker_objects_only_task(self):
        submission = Submission.objects.first()
        result = create_study_broker_objects_only_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        bo = BrokerObject.objects.first()
        self.assertEqual('study', bo.type)
        self.assertEqual(bo.pk, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(str(bo.pk), tprs.first().task_return_value)

    def test_create_study_broker_objects_only_task_existing_study(self):
        submission = Submission.objects.first()
        user = User.objects.first()
        bo = submission.brokerobject_set.create(type='study', user=user)
        result = create_study_broker_objects_only_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(bo.pk, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(str(bo.pk), tprs.first().task_return_value)

    def test_create_study_broker_objects_only_task_no_submission(self):
        result = create_study_broker_objects_only_task.apply_async(
            kwargs={
                'submission_id': 4711,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tprs.first().task_return_value)

    def test_prepare_ena_study_xml_task(self):
        submission = Submission.objects.first()
        BrokerObject.objects.add_study_only(submission)

        result = prepare_ena_study_xml_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        study_text_data = AuditableTextData.objects.first()
        self.assertEqual('study.xml', study_text_data.name)
        self.assertEqual(study_text_data.pk, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(str(study_text_data.pk),
                         tprs.first().task_return_value)

    def test_prepare_ena_study_xml_task_no_brokerobject(self):
        submission = Submission.objects.first()
        result = prepare_ena_study_xml_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tprs.first().task_return_value)

    def test_prepare_ena_study_xml_task_existing_study_xml(self):
        submission = Submission.objects.first()
        study_xml = submission.auditabletextdata_set.create(
            name='study.xml', text_data='<STUDY></STUDY>')
        result = prepare_ena_study_xml_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(study_xml.pk, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(str(study_xml.pk),
                         tprs.first().task_return_value)

    def test_prepare_ena_study_xml_task_no_submission(self):
        result = prepare_ena_study_xml_task.apply_async(
            kwargs={
                'submission_id': 666,
            }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tprs.first().task_return_value)

    def test_register_study_at_ena_task_existing_pid(self):
        submission = Submission.objects.first()
        study_bo = BrokerObject.objects.add_study_only(submission)
        pid = study_bo.persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJ007'
        )
        result = register_study_at_ena_task.apply_async(
            kwargs={'submission_id': submission.pk, }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tprs.first().task_return_value)
        self.assertEqual(0, len(RequestLog.objects.all()))

    def test_register_study_at_ena_task_no_study_xml(self):
        submission = Submission.objects.first()
        result = register_study_at_ena_task.apply_async(
            kwargs={'submission_id': submission.pk, }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tprs.first().task_return_value)
        self.assertEqual(0, len(RequestLog.objects.all()))

    def test_register_study_at_ena_task_no_study_brokerobject(self):
        submission = Submission.objects.first()
        study_xml = submission.auditabletextdata_set.create(
            name='study.xml', text_data='<STUDY></STUDY>')
        result = register_study_at_ena_task.apply_async(
            kwargs={'submission_id': submission.pk, }
        )
        self.assertEqual(TaskProgressReport.CANCELLED, result.get())
        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual(TaskProgressReport.CANCELLED,
                         tprs.first().task_return_value)
        self.assertEqual(0, len(RequestLog.objects.all()))

    @responses.activate
    def test_register_study_at_ena_task(self):
        submission = Submission.objects.first()
        study_bo = BrokerObject.objects.add_study_only(submission)
        study_xml = submission.auditabletextdata_set.create(
            name='study.xml', text_data='<STUDY></STUDY>')
        responses.add(
            responses.POST,
            submission.user.site_configuration.ena_server.url,
            body=_get_ena_register_study_response(),
            status=200,
        )
        result = register_study_at_ena_task.apply_async(
            kwargs={'submission_id': submission.pk, }
        )
        request_id, status_code, content = result.get()
        self.assertIsNotNone(request_id)
        self.assertEqual(200, status_code)
        self.assertTrue(content.startswith('<?xml'))

        tprs = TaskProgressReport.objects.all()
        self.assertEqual(1, len(tprs))
        self.assertEqual('tasks.register_study_at_ena_task',
                         tprs.first().task_name)
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        log = request_logs.first()
        self.assertEqual(200, log.response_status)
        self.assertEqual(submission.broker_submission_id, log.submission_id)

    @responses.activate
    def test_register_study_with_parse_result(self):
        submission = Submission.objects.first()
        study_bo = BrokerObject.objects.add_study_only(submission)
        print('STUDY BO pk ', study_bo.pk)
        study_xml = submission.auditabletextdata_set.create(
            name='study.xml', text_data='<STUDY></STUDY>')
        responses.add(
            responses.POST,
            submission.user.site_configuration.ena_server.url,
            body=_get_ena_register_study_response(study_bo.pk),
            status=200,
        )
        register_chain = register_study_at_ena_task.s(
            submission_id=submission.pk).set(
            countdown=SUBMISSION_DELAY) | process_ena_response_task.s(
            submission_id=submission.pk,
            close_submission_on_success=False).set(
            countdown=SUBMISSION_DELAY)
        register_chain()
        pids = PersistentIdentifier.objects.all()
        self.assertEqual(2, len(pids))
        primary = BrokerObject.objects.get_study_primary_accession_number(
            submission)
        self.assertEqual(primary, pids.filter(pid_type='PRJ').first())

        tprs = TaskProgressReport.objects.all()
        self.assertEqual(2, len(tprs))
        task_names = [
            'tasks.register_study_at_ena_task',
            'tasks.process_ena_response_task'
        ]
        for t in tprs:
            self.assertIn(t.task_name, task_names)
            self.assertEqual(t.submission, submission)
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        log = request_logs.first()
        self.assertEqual(200, log.response_status)
        self.assertEqual(submission.broker_submission_id, log.submission_id)


class TestTargetedSequenceSubmissionTasks(TestCase):

    @classmethod
    def setUpTestData(cls):
        TestTargetedSequencePreparationTasks.setUpTestData()
        submission = Submission.objects.first()
        cls.study_bo = BrokerObject.objects.add_study_only(submission)
        study_data = prepare_study_data_only(submission=submission)
        cls.study_text_data = store_single_data_item_as_auditable_text_data(
            submission=submission, data=study_data)

        parsed = parse_ena_submission_response(
            _get_ena_register_study_response(cls.study_bo.pk)
        )
        BrokerObject.objects.append_pids_from_ena_response(parsed)

        cls.submission_folder = os.path.join(settings.MEDIA_ROOT,
                                             str(
                                                 submission.broker_submission_id))

        with open(os.path.join(
                _get_test_data_dir_path(),
                'tsv_files/valid_template_example.tsv.gz'),
                'br') as gz_file:
            f = File(gz_file)
            f.name = 'valid_template_example.tsv.gz'
            submission.submissionupload_set.create(
                user=submission.user,
                file=f
            )
            f.close()

    @classmethod
    def _register_new_random_study(cls):
        # TODO: this will always create a new submission with a new id
        #   this result in always registering a new study for this submission
        #   when not mocking responses
        submission = Submission.objects.create(
            user=TestTargetedSequencePreparationTasks.user,
            center_name=TestTargetedSequencePreparationTasks.center,
            target=ENA,
            release=True,
            data={
                "requirements": {
                    "title": "Simple ENA Data (dynamic ...)",
                    "description": "Reduced Data for testing", }
            }
        )
        submission.user.site_configuration = TestTargetedSequencePreparationTasks.site_config
        submission.user.save()
        study = BrokerObject.objects.add_study_only(submission=submission)
        study_data = prepare_study_data_only(submission=submission)
        study_text_data = store_single_data_item_as_auditable_text_data(
            submission=submission, data=study_data)
        # TODO: works when credentials are set properly
        register_chain = register_study_at_ena_task.s(
            submission_id=submission.pk).set(
            countdown=SUBMISSION_DELAY) | process_ena_response_task.s(
            submission_id=submission.pk,
            close_submission_on_success=False).set(
            countdown=SUBMISSION_DELAY)
        register_chain()
        return study

    @classmethod
    def _prepare_objects_for_registered_study(cls, broker_submission_id,
                                              accession_no, do_store=True):
        submission = Submission.objects.create(
            broker_submission_id=UUID(broker_submission_id),
            user=TestTargetedSequencePreparationTasks.user,
            center_name=TestTargetedSequencePreparationTasks.center,
            target=ENA,
            release=True,
            data={
                "requirements": {
                    "title": "Simple ENA Data (dynamic ...)",
                    "description": "Reduced Data for testing", }
            }
        )
        study = BrokerObject.objects.add_study_only(submission=submission)
        study.persistentidentifier_set.create(
            pid_type='PRJ',
            archive='ENA',
            pid=accession_no
        )
        with open(os.path.join(
                _get_test_data_dir_path(),
                'tsv_files/valid_template_example.tsv.gz'),
                'br') as gz_file:
            f = File(gz_file)
            f.name = 'valid_template_example.tsv.gz'
            submission.submissionupload_set.create(
                user=submission.user,
                file=f
            )
            f.close()
        create_ena_manifest_text_data(submission)
        if do_store:
            store_manifest_to_filesystem(submission)
        return submission

    def test_create_targeted_sequence_ena_manifest_task(self):
        submission = Submission.objects.first()
        result = create_targeted_sequence_ena_manifest_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertEqual(1,
                         len(AuditableTextData.objects.filter(name='MANIFEST')))
        atd = AuditableTextData.objects.get(name='MANIFEST')
        self.assertEqual(atd.pk, result.get())

        self.assertIn(
            PersistentIdentifier.objects.filter(pid_type='PRJ').first().pid,
            atd.text_data)

    def test_store_manifest_to_filesystem(self):
        submission = Submission.objects.first()
        create_ena_manifest_text_data(submission)

        store_manifest_to_filesystem(submission)

        dir = os.listdir(self.submission_folder)
        self.assertIn('MANIFEST', dir)
        head, tail = os.path.split(
            submission.submissionupload_set.first().file.name)
        self.assertIn(tail, dir)

    @skip('request to ena test server with flags validate and test')
    def test_submit_targeted_sequences_validate(self):
        # ---------------------------------------------
        # 13.06.2020  Testing started at 12:44 ...
        # bsi: 7159acef-51a1-4378-9716-78f4495f0db4
        # study main PRJ: PRJEB39350
        submission = self._prepare_objects_for_registered_study(
            '7159acef-51a1-4378-9716-78f4495f0db4', 'PRJEB39350')
        # ----------------------------------------------

        submit_targeted_sequences(
            username=TestTargetedSequencePreparationTasks.site_config.ena_server.username,
            password=TestTargetedSequencePreparationTasks.site_config.ena_server.password,
            submission=submission,
            test=True,
            validate=True
        )

        self.assertEqual(1, len(RequestLog.objects.all()))
        r = RequestLog.objects.first()
        pprint(r.__dict__)
        self.assertTrue(r.files.endswith('MANIFEST'))
        self.assertTrue(r.url.endswith('MANIFEST'))
        expected_keys = ['folder_content', 'output', 'webin_report']
        for k in r.request_details.keys():
            self.assertIn(k, expected_keys)

    @skip('request to ena test server with flag test')
    def test_submit_targeted_sequences_submit(self):
        # ---------------------------------------------
        # 13.06.2020  Testing started at 12:44 ...
        # bsi: 7159acef-51a1-4378-9716-78f4495f0db4
        # study main PRJ: PRJEB39350
        submission = self._prepare_objects_for_registered_study(
            '7159acef-51a1-4378-9716-78f4495f0db4', 'PRJEB39350')
        # ----------------------------------------------

        submit_targeted_sequences(
            username=TestTargetedSequencePreparationTasks.site_config.ena_server.username,
            password=TestTargetedSequencePreparationTasks.site_config.ena_server.password,
            submission=submission,
            test=True,
            validate=False
        )

        self.assertEqual(1, len(RequestLog.objects.all()))
        r = RequestLog.objects.first()
        pprint(r.__dict__)
        self.assertTrue(r.files.endswith('MANIFEST'))
        self.assertTrue(r.url.endswith('MANIFEST'))
        expected_keys = ['folder_content', 'output', 'webin_report']
        for k in r.request_details.keys():
            self.assertIn(k, expected_keys)

    @skip('request to real server')
    def test_submit_targeted_sequences_to_ena_task(self):
        # ---------------------------------------------
        # 21.07.2020  Testing started at 08:12 ...
        # bsi: 47e651ca-876d-42f7-b3d2-8015b51996f1
        # study main PRJ: PRJEB39475
        submission = self._prepare_objects_for_registered_study(
            '47e651ca-876d-42f7-b3d2-8015b51996f1', 'PRJEB39475',
            do_store=False)

        result = submit_targeted_sequences_to_ena_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'do_test': True,
                'do_validate': False,
            }
        )
        res = result.get()
        self.assertTrue(res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual(1, len(RequestLog.objects.all()))
        r = RequestLog.objects.first()
        pprint(r.__dict__)
        print('--------------------------------------')
        t = TaskProgressReport.objects.first()
        pprint(t.__dict__)

        # ----------------------------------------------------------------------
        # study = self._register_new_random_study()
        #
        # print('--------------------------------------')
        # study = BrokerObject.objects.get(pk=study.pk)
        # print('\n')
        # pprint(study.__dict__)
        # for p in study.persistentidentifier_set.all():
        #     print('\n')
        #     pprint(p.__dict__)
        # ----------------------------------------------------------------------

        # responses.add(
        #     responses.POST,
        #     submission.user.site_configuration.ena_server.url,
        #     body=_get_ena_register_study_response(),
        #     status=200,
        # )

        # ---------------
        # from gfbio_submissions.brokerage.tasks import \
        #     register_study_at_ena_task, process_ena_response_task, \
        #     submit_targeted_sequences_to_ena_task, \
        #     process_targeted_sequence_results_task
        # submission_chain = register_study_at_ena_task.s(
        #     submission_id=submission.pk).set(
        #     countdown=SUBMISSION_DELAY) | process_ena_response_task.s(
        #     submission_id=submission.pk,
        #     close_submission_on_success=False).set(
        #     countdown=SUBMISSION_DELAY) | submit_targeted_sequences_to_ena_task.s(
        #     submission_id=submission.pk).set(
        #     countdown=SUBMISSION_DELAY) | process_targeted_sequence_results_task.s(
        #     submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)
        #
        # submission_chain()

    @skip('needs a mocked submission plus folder with content of TS-submission')
    def test_process_targeted_sequence_results_task(self):
        # ---------------------------------------------
        # 21.07.2020  Testing started at 08:12 ...
        # bsi: 47e651ca-876d-42f7-b3d2-8015b51996f1
        # study main PRJ: PRJEB39475
        submission = self._prepare_objects_for_registered_study(
            '47e651ca-876d-42f7-b3d2-8015b51996f1', 'PRJEB39475',
            do_store=False)
        result = process_targeted_sequence_results_task.apply_async(
            kwargs={
                'submission_id': submission.pk
            }
        )

        res = result.get()
        self.assertTrue(res)
        self.assertEqual(1, len(TaskProgressReport.objects.all()))
        self.assertEqual(1, len(
            PersistentIdentifier.objects.filter(pid_type='TSQ')))


# TODO: remove
@skip('just for prototyping')
class TestCLI(TestCase):

    @classmethod
    def setUpTestData(cls):
        resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        ena_resource_cred = ResourceCredential.objects.create(
            title='Ena testserver access',
            url='https://www-test.ebi.ac.uk/ena/submit/drop-box/submit/',
            authentication_string='',
            # compare devserver
            username='',
            password=''
        )
        site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=ena_resource_cred,
            ena_report_server=resource_cred,
            pangaea_token_server=resource_cred,
            pangaea_jira_server=resource_cred,
            helpdesk_server=resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        user = User.objects.create(
            username="user1"
        )
        user.update_or_create_external_user_id('0815', 'goe_id')
        user.name = 'Kevin Horstmeier'
        user.email = 'khors@me.de'
        user.site_configuration = site_config
        user.save()
        center = CenterName.objects.create(center_name="test-center")
        submission = Submission.objects.create(
            broker_submission_id=UUID(
                '4e5c7fb2-fb9f-447f-92db-33a5f99cba8e'),
            user=user,
            center_name=center,
            target=ENA,
            release=True,
            # TODO: this+file would be sufficient for targeted sequences
            # data={
            #     "requirements": {
            #         "title": "Simple ENA Data",
            #         "description": "Reduced Data for testing", }
            # }
            # TODO: full data to be able to create brokerobjects
            data=_get_ena_data()
        )

        submission_folder = os.path.join(settings.MEDIA_ROOT,
                                         str(submission.broker_submission_id))
        upload_path = os.path.join(submission_folder,
                                   'test_submission_upload.tsv')

        simple_file = SimpleUploadedFile('test_submission_upload.tsv',
                                         b'these\tare\tthe\tfile\tcontents')

        upload = SubmissionUpload.objects.create(
            submission=submission,
            user=user,
            file=simple_file,
        )

        with gzip.open(upload_path + '.gz', 'wb') as f:
            f.writelines(
                [
                    b'#template_accession ERT000020\n',
                    b'ENTRYNUMBER	ORGANISM	ISOLATE	DEVSTAGE	TISSUETYPE	SEX	SPECVOUCH	5CDS	3CDS	5PARTIAL	3PARTIAL	CODONSTART	COITABLE	COUNTRY	AREA	LOCALITY	LATLON	ISOSOURCE	COLDATE	COLBY	IDBY	PFNAME1	PFSEQ1	PRNAME1	PRSEQ1	SEQUENCE\n'
                    b'1	Glossina morsitans submorsitans	234-51-00004-45-10_G_COI	adult	gut	f	234-51-00004	1, 1	645	yes	yes	1	5	Nigeria	Bauchi State	Yankari Game Reserve	9.81 N 10.62 E	"Savannah woodland; River plain"	23-Feb-2014	"Stephen Sakiu Shaida; Judith Sophie Weber; Usman Baba; Ahmadu Adamu; Jonathan Andrew Nok; Soerge Kelm"	"Judith Sophie Weber; Stephen Sakiu Shaida"	CO1-f	TTGATTTTTTGGTCATCCAGAAGT	CO1-r	TGAAGCTTAAATTCATTGCACTAATC	TTTATTGTCTGAGCTCATCATATATTTACAGTTGGAATAGATGTAGATACTCGTGCATATTTTACTTCAGCTACAATAATTATTGCAGTACCAACAGGAATTAAAATTTTTAGATGATTAGCTACTCTTCATGGAACTCAAATCTCTTACTCTCCGGCTATTCTTTGAGCTCTTGGTTTTATTTTCTTATTTACAGTAGGAGGTTTAACAGGTGTAGTTTTAGCAAATTCATCTGTCGATATTATTTTACATGATACTTATTATGTCGTAGCTCATTTTCATTATGTGTTATCTATAGGAGCTGTATTTGCAATTATAGCTGGATTTATTCATTGATATCCTTTATTTACTGGTTTAACTATAAATTCATCTATATTAAAAAGTCAATTTATAGTAATATTTATTGGAGTAAATTTAACTTTTTTTCCTCAACACTTTTTAGGATTAGCAGGAATACCTCGTCGTTATTCAGATTACCCTGACGCTTACACAACTTGAAATGTAGTTTCTACAATTGGATCAACAATTTCCTTATTAGGAATTTTATTTTTTTTCTTTATTATTTGAGAAAGTTTAATTAGTCAACGAAAAGTTATCTTTCCTATTCAATTAAATTCTTCTATTGAATGATTACAAAATACGCCC'
                ]
            )
            f.close()
        upload.file.name = upload_path + '.gz'
        upload.save()

    # @skip('database inconsistencies when running with other tests')
    @responses.activate
    def test_targeted_sequences_workflow_prototyping(self):
        submission = Submission.objects.first()

        # 1 register study
        # regular case: in pre_process_molecular_data_chain of SubmissionTransferHandler
        #   prepare_ena_submission_data_task is called which creates textdatas
        #   triggered from post or put view
        #   or from admin actions create_broker_objects_and_ena_xml and
        #   re_create_ena_xml
        # -> transfer_data_to_ena_task uses textdata to get payload

        # ----------------------------------------------------------------------
        # TODO: works only for full valid molecular requirements. not study data alone
        #   +1 for target "targeted sequences" plus schema
        BrokerObject.objects.add_submission_data(submission)
        # print(submission.brokerobject_set.all())

        # basically create XML from all single Brokerobjects json
        ena_submission_data = prepare_ena_data(submission=submission)
        # create AuditableTextData from all filename, filecontent tuples in
        #   ena_submission_data
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)

        # basically assemble_ena_submission_data in task
        study_text_data = submission.auditabletextdata_set.filter(
            name='study.xml').first()
        # print(study_text_data)
        request_data = {
            'STUDY': (
                '{0}'.format(smart_str(study_text_data.name)),
                '{0}'.format(smart_str(study_text_data.text_data))
            )
        }

        # like in send_submission_to_ena
        enalizer = Enalizer(submission=submission,
                            alias_postfix=submission.broker_submission_id)
        outgoing_request_id = uuid4()
        request_data[
            'SUBMISSION'] = enalizer.prepare_submission_xml_for_sending(
            action='ADD',
            outgoing_request_id=outgoing_request_id, )

        ena_resource = submission.user.site_configuration.ena_server

        responses.add(
            responses.POST,
            ena_resource.url,
            body=_get_ena_register_study_response(),
            status=200,
        )

        auth_params = {
            'auth': ena_resource.authentication_string,
        }

        # ACTUAL REQUEST
        response, log_id = logged_requests.post(
            ena_resource.url,
            submission=submission,
            return_log_id=True,
            params=auth_params,
            files=request_data,
            verify=False,
            request_id=outgoing_request_id
        )

        # # in real life: request_id = xml submission alias
        # #               alias in study xml study.pk:submission.bsi

        # print('-------------------------------------------------')
        # print(response.status_code)
        # print(response.content)
        # print('-------------------------------------------------')

        # ----------------------------------------------------------------------

        parsed = parse_ena_submission_response(response.content)
        success = True if parsed.get('success', False) == 'true' else False
        if success:
            print('SUCCESS')
            BrokerObject.objects.append_pids_from_ena_response(parsed)
            # if close_submission_on_success:
            #     submission.status = Submission.CLOSED
            # submission.save()
            # return True
        else:
            print('NO SUCCESS')

        # TODO: primary PRJ vs regular ACC Persistent ids
        #   for now use primary
        # ----------------------------------------------------------------------
        # ----------------------------------------------------------------------
        # MANIFEST
        # STUDDY
        # study_bo = submission.brokerobject_set.filter(type='study').first()
        # study_pid = study_bo.persistentidentifier_set.filter(
        #     archive='ENA').filter(pid_type='PRJ').first()
        # print(study_pid.pid)
        # Name
        # '{}:{}'.format(study_bo.pk, submission.broker_submission_id)
        # # TAB/flatfile
        # upload = submission.submissionupload_set.filter(
        #     file__endswith='.tsv.gz').first()
        # # pprint(upload.__dict__)
        # path, filename = os.path.split(upload.file.name)
        # print(filename)
        # Authors
        # ->  contributors / usercomunitcatipon
        # Address
        # -> contributor

        # INPUT dir -> where files named in manifest are stored
        #   -> submission_upload = bsi/filenmame ==> directory = MEDIA/bsi

        # OUTPUT dir -> where output from cli should go
        # output = io.StringIO()
        submission_folder = os.path.join(settings.MEDIA_ROOT,
                                         str(submission.broker_submission_id))
        # with open() as output:
        #     writer = csv.writer(output, delimiter=str('\t'))
        #     writer.writerow(('STUDY', study_pid.pid))
        #     writer.writerow(('NAME', '{}:{}'.format(study_bo.pk,
        #                                             submission.broker_submission_id)))
        #     writer.writerow(('TAB', filename))
        #     writer.writerow(('AUTHORS', 'Weber M., Kostadinov I.;'))
        #     writer.writerow(('ADDRESS',
        #                      'University of Bremen, Leobener Str. 5, 28359 Bremen, Germany'))
        #     content = output.getvalue()
        #     output.close()
        #     print(content)
        # TODO: next: do webcli to testserver and check output, folders etc

        submit_targeted_sequences(
            username=ena_resource.username,
            password=ena_resource.password,
            submission=submission,
        )

        # TODO: put this workflow in tasks, then every error can be reviewed in task progress reports
        #   take care the input is logges as well. Goal is that this imperfect flow is put
        #   into a generally working tool. THEN: tickets for  imporovement

    @responses.activate
    def test_targeted_sequence_submission_chain(self):
        submission = Submission.objects.first()

        # precondition is:
        BrokerObject.objects.add_submission_data(submission)
        ena_submission_data = prepare_ena_data(submission=submission)
        store_ena_data_as_auditable_text_data(submission=submission,
                                              data=ena_submission_data)
        # -------------------------------------------------------------

        responses.add(
            responses.POST,
            submission.user.site_configuration.ena_server.url,
            body=_get_ena_register_study_response(),
            status=200,
        )
        from gfbio_submissions.brokerage.tasks import \
            register_study_at_ena_task, process_ena_response_task, \
            submit_targeted_sequences_to_ena_task, \
            process_targeted_sequence_results_task
        submission_chain = register_study_at_ena_task.s(
            submission_id=submission.pk).set(
            countdown=SUBMISSION_DELAY) | process_ena_response_task.s(
            submission_id=submission.pk,
            close_submission_on_success=False).set(
            countdown=SUBMISSION_DELAY) | submit_targeted_sequences_to_ena_task.s(
            submission_id=submission.pk).set(
            countdown=SUBMISSION_DELAY) | process_targeted_sequence_results_task.s(
            submission_id=submission.pk).set(countdown=SUBMISSION_DELAY)

        submission_chain()

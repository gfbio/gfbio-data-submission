# -*- coding: utf-8 -*-
from pprint import pprint
from uuid import uuid4

import responses
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.utils.encoding import smart_text

from gfbio_submissions.brokerage.configuration.settings import ENA
from gfbio_submissions.brokerage.models import Submission, SubmissionUpload, \
    BrokerObject, CenterName
from gfbio_submissions.brokerage.tests.utils import _get_ena_data, \
    _get_ena_register_study_response
from gfbio_submissions.brokerage.utils.ena import prepare_ena_data, \
    store_ena_data_as_auditable_text_data, Enalizer, \
    parse_ena_submission_response
from gfbio_submissions.brokerage.utils.ena_cli import cli_call
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential, RequestLog
from gfbio_submissions.generic.utils import logged_requests
from gfbio_submissions.users.models import User


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
            authentication_string=''  # compare devserver
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
        user.external_user_id = '0815'
        user.name = 'Kevin Horstmeier'
        user.email = 'khors@me.de'
        user.site_configuration = site_config
        user.save()
        center = CenterName.objects.create(center_name="test-center")
        submission = Submission.objects.create(
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
        simple_file = SimpleUploadedFile('test_submission_upload.tsv.gz',
                                         b'these\tare\tthe\tfile\tcontents')

        submission_upload = SubmissionUpload.objects.create(
            submission=submission,
            user=user,
            file=simple_file,
        )

    def test_simple_calls(self):
        cli_call()

    @responses.activate
    def test_targeted_sequences_workflow_prototyping(self):
        submission = Submission.objects.first()
        # to match mocked response submission_id
        submission.broker_submission_id = uuid4(
            'd8a8b861-3761-443c-94ff-e0a89ae3b0c9')
        submission.save()

        # print(submission.submissionupload_set.all())
        # 1 register study
        # regular case: in pre_process_molecular_data_chain of SubmissionTransferHandler
        #   prepare_ena_submission_data_task is called which creates textdatas
        #   triggered from post or put view
        #   or from admin actions create_broker_objects_and_ena_xml and
        #   re_create_ena_xml
        # -> transfer_data_to_ena_task uses textdata to get payload

        # study_text_data = submission.auditabletextdata_set.filter(
        #     name='study.xml')
        # print(study_text_data)
        # print(submission.brokerobject_set.all())

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
                '{0}'.format(smart_text(study_text_data.name)),
                '{0}'.format(smart_text(study_text_data.text_data))
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

        # pprint(request_data)

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
            outgoing_request_id=outgoing_request_id
        )
        # study_bo = BrokerObject.objects.filter(type='study').first()
        # pprint(study_bo.__dict__)

        # # in real life: request_id = xml submission alias
        # #               alias in study xml study.pk:submission.bsi

        # print(response.status_code)
        # print(response.content)
        # print(log_id)
        # pprint(RequestLog.objects.get(request_id=log_id).__dict__)

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

        study_bo = BrokerObject.objects.filter(type='study').first()
        pprint(study_bo.__dict__)
        for p in study_bo.persistentidentifier_set.all():
            print('---------------')
            pprint(p.__dict__)

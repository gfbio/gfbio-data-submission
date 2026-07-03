# -*- coding: utf-8 -*-
from gfbio_submissions.generic.models.resource_credential import ResourceCredential
from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User
import responses
from unittest.mock import patch

from django.conf import settings
from django.utils import timezone

from gfbio_submissions.brokerage.configuration.settings import GFBIO_HELPDESK_TICKET, JIRA_MESSAGES_WAIT_DELAY, JIRA_MESSAGES_MAX_MESSAGES_IN_QUEUE, JIRA_MESSAGES_MAX_DELAY
from gfbio_submissions.brokerage.tasks.process_tasks.send_message_to_jira_task import send_message_to_jira_task
from gfbio_submissions.brokerage.models.jira_queue_message import JiraQueueMessage
from gfbio_submissions.brokerage.tests.utils import _get_pangaea_comment_response

from ...models.submission import Submission
from .test_tasks_base import TestTasks


class TestSendMessageToJiraTasks(TestTasks):
    @classmethod
    def setUpTestData(cls):
        help_desk = ResourceCredential.objects.create(url="https://example.gfbio.dev")
        site_configuration = SiteConfiguration.objects.create(helpdesk_server=help_desk)
        user = User.objects.create(site_configuration=site_configuration)
        submission = Submission.objects.create(user=user)
        submission.additionalreference_set.create(primary=True, type=GFBIO_HELPDESK_TICKET, reference_key="SAND-123")
        submission.save()
        cls.submission = submission


    def _create_jqmsg(self, file, seconds_ago, missmatch=False, status=JiraQueueMessage.STATUS_NOT_SENT):
        msg_delay = timezone.now() - timezone.timedelta(seconds=seconds_ago)
        jqmsg = JiraQueueMessage.objects.create(
            submission_id = self.submission.id,
            created = msg_delay,
            modified = msg_delay,
            type = JiraQueueMessage.TYPE_CHECKSUM_CALCULATED,
            data = {
                "file_name": file,
                "checksum_missmatched": missmatch
            },
            status = status
        )
        if missmatch:
            jqmsg.data["provided_checksum"] = "prov_chksm"
            jqmsg.data["calculated_checksum"] = "calc_chksm",    
        jqmsg.save()
        return jqmsg


    def _run_test(self, msg_id):
        responses.add(
            responses.POST,
            "https://example.gfbio.dev/rest/api/2/issue/SAND-123/comment",
            json=_get_pangaea_comment_response(),
            status=200,
        )
        
        return send_message_to_jira_task(
            submission_id=self.submission.id,
            previous_result=msg_id,
        )
    

    def _assert_jq_msg_status(self, expected, jq_msg):
        self.assertEqual(expected, JiraQueueMessage.objects.get(pk=jq_msg.pk).status)


    @responses.activate
    def test_send_message_to_jira_task_simple(self):
        jqmsg = self._create_jqmsg("test.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY + 150)
        result_bool, result_msg = self._run_test(msg_id=jqmsg.id)
        self.assertTrue(result_bool)
        self.assertEqual("Message was sent: h2. 1 File(s) where uploaded to the submission and we verified the checksums:\nh3. Files where the Checksums were matches:\ntest.fastq.gz", result_msg)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, jqmsg)


    @responses.activate
    def test_send_message_to_jira_task_multi_msg(self):
        jqmsg1 = self._create_jqmsg("test1.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY + 150)
        jqmsg2 = self._create_jqmsg("test2.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY + 100)
        
        result_bool, result_msg = self._run_test(msg_id=jqmsg2.id)
        self.assertTrue(result_bool)
        self.assertEqual("Message was sent: h2. 2 File(s) where uploaded to the submission and we verified the checksums:\nh3. Files where the Checksums were matches:\ntest1.fastq.gz, test2.fastq.gz", result_msg)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, jqmsg1)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, jqmsg2)


    @responses.activate
    def test_send_message_to_jira_task_do_not_send(self):
        jqmsg1 = self._create_jqmsg("test1.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY + 150)
        jqmsg2 = self._create_jqmsg("test2.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY - 500)
        
        result_bool, result_msg = self._run_test(msg_id=jqmsg1.id)
        self.assertTrue(result_bool)
        self.assertEqual("Newer Message found.", result_msg)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_NOT_SENT, jqmsg1)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_NOT_SENT, jqmsg2)


    @responses.activate
    def test_send_message_to_jira_task_send_batch(self):
        messages = []
        for i in range(0, JIRA_MESSAGES_MAX_MESSAGES_IN_QUEUE - 1):
            messages.append(self._create_jqmsg(f"test-{i}.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY / 2 - i))
        result_bool, result_msg = self._run_test(msg_id=messages[-2].id)
        self.assertTrue(result_bool)
        self.assertEqual("Newer Message found.", result_msg)

        messages.append(self._create_jqmsg(f"test-x.fastq.gz", seconds_ago=10))
        
        result_bool, result_msg = self._run_test(msg_id=messages[-2].id)
        self.assertTrue(result_bool)
        
        for msg in messages:
            self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, msg)
            self.assertTrue(msg.data["file_name"] in result_msg)


    @responses.activate
    def test_send_message_to_jira_task_msg_overdue(self):
        jqmsg1 = self._create_jqmsg("test1.fastq.gz", seconds_ago=JIRA_MESSAGES_MAX_DELAY + 150)
        jqmsg2 = self._create_jqmsg("test2.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY - 500)
        
        result_bool, result_msg = self._run_test(msg_id=jqmsg1.id)
        self.assertTrue(result_bool)
        self.assertEqual("Message was sent: h2. 2 File(s) where uploaded to the submission and we verified the checksums:\nh3. Files where the Checksums were matches:\ntest1.fastq.gz, test2.fastq.gz", result_msg)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, jqmsg1)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, jqmsg2)


    @responses.activate
    def test_send_message_to_jira_task_ingore_other_sent_messages(self):
        jqmsg1 = self._create_jqmsg("test1.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY + 150, status=JiraQueueMessage.STATUS_PICKED_UP)
        jqmsg2 = self._create_jqmsg("test2.fastq.gz", seconds_ago=JIRA_MESSAGES_WAIT_DELAY + 100)
        
        result_bool, result_msg = self._run_test(msg_id=jqmsg2.id)
        self.assertTrue(result_bool)
        self.assertEqual("Message was sent: h2. 2 File(s) where uploaded to the submission and we verified the checksums:\nh3. Files where the Checksums were matches:\ntest2.fastq.gz", result_msg)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_PICKED_UP, jqmsg1)
        self._assert_jq_msg_status(JiraQueueMessage.STATUS_SENT, jqmsg2)
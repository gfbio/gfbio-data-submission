# -*- coding: utf-8 -*-
import datetime
import json
from unittest import skip

import requests
import responses
from django.test import TestCase
from jira import JIRA, JIRAError
from requests import ConnectionError
from requests.structures import CaseInsensitiveDict

from gfbio_submissions.brokerage.configuration.settings import JIRA_ATTACHMENT_SUB_URL, JIRA_ISSUE_URL
from gfbio_submissions.brokerage.utils.pangaea import get_pangaea_login_token
from gfbio_submissions.generic.models.ResourceCredential import ResourceCredential


class TestGFBioJiraApi(TestCase):
    base_url = "http://helpdesk.gfbio.org"

    @skip("Test against helpdesk server")
    def test_create_request(self):
        url = "http://helpdesk.gfbio.org{0}".format(JIRA_ISSUE_URL)
        response = requests.post(
            url=url,
            auth=("brokeragent", ""),
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "fields": {
                        "project": {"key": "SAND"},
                        "summary": "Testing REST API programmatic",
                        "description": "Generating JIRA issues via django unit-test.",
                        "issuetype": {"name": "IT Help"},
                        "reporter": {"name": "testuser1"},
                        "customfield_10010": "sand/data-submission",
                    }
                }
            ),
        )

    @skip("Test against helpdesk server")
    def test_comment_existing_ticket(self):
        ticket_key = "SAND-1535"
        ticket_action = "comment"
        url = "{0}{1}/{2}/{3}".format(self.base_url, JIRA_ISSUE_URL, ticket_key, ticket_action)
        response = requests.post(
            url=url,
            auth=("brokeragent", ""),
            headers={"Content-Type": "application/json"},
            data=json.dumps({"body": "programmatic update of ticket {}".format(ticket_key)}),
        )
        # 201
        # b'{"self":"https://helpdesk.gfbio.org/rest/api/2/issue/16029/comment/21606","id":"21606","author":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"body":"programmatic update of ticket SAND-1535","updateAuthor":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"created":"2019-09-17T13:46:17.002+0000","updated":"2019-09-17T13:46:17.002+0000"}'

    @skip("Test against helpdesk server")
    def test_get_comments(self):
        ticket_key = "SAND-1535"
        ticket_action = "comment"
        url = "{0}{1}/{2}/{3}".format(self.base_url, JIRA_ISSUE_URL, ticket_key, ticket_action)
        response = requests.get(
            url=url,
            auth=("brokeragent", ""),
            headers={"Content-Type": "application/json"},
        )
        # 200
        # b'{"startAt":0,"maxResults":1048576,"total":1,"comments":[{"self":"https://helpdesk.gfbio.org/rest/api/2/issue/16029/comment/21606","id":"21606","author":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"body":"programmatic update of ticket SAND-1535","updateAuthor":{"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org","emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},"displayName":"Broker Agent","active":true,"timeZone":"Europe/Berlin"},"created":"2019-09-17T13:46:17.002+0000","updated":"2019-09-17T13:46:17.002+0000"}]}'

    @skip("Test against helpdesk server")
    def test_get_and_update_existing_ticket(self):
        # was generic submission, done via gfbio-portal
        ticket_key = "SAND-1535"
        url = "{0}{1}/{2}".format(
            self.base_url,
            JIRA_ISSUE_URL,
            ticket_key,
        )
        response = requests.get(
            url=url,
            auth=("brokeragent", ""),
        )
        response = requests.put(
            url=url,
            auth=("brokeragent", ""),
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    "fields": {
                        # single value/string
                        "customfield_10205": "New Name Marc Weber, Alfred E. Neumann",
                        # array of values/strings
                        "customfield_10216": [
                            {"value": "Uncertain"},
                            {"value": "Nagoya Protocol"},
                            {"value": "Sensitive Personal Information"},
                        ],
                    }
                }
            ),
        )
        # self.assertEqual(204, response.status_code)
        # self.assertEqual(0, len(response.content))

    @skip("Test against helpdesk server")
    def test_add_attachment(self):
        ticket_key = "SAND-1535"
        url = "{0}{1}/{2}/{3}".format(
            self.base_url,
            JIRA_ISSUE_URL,
            ticket_key,
            JIRA_ATTACHMENT_SUB_URL,
        )
        headers = CaseInsensitiveDict({"content-type": None, "X-Atlassian-Token": "nocheck"})

        data = TestHelpDeskTicketMethods._create_test_data("/tmp/test_primary_data_file")
        # files = {'file': file}
        # files = {'file': open(file, 'rb')}
        response = requests.post(
            url=url,
            auth=("brokeragent", ""),
            headers=headers,
            files=data,
        )
        # 200
        # b'[{"self":"https://helpdesk.gfbio.org/rest/api/2/attachment/13820",
        # "id":"13820","filename":"test_primary_data_file","author":
        # {"self":"https://helpdesk.gfbio.org/rest/api/2/user?username=
        # brokeragent","name":"brokeragent","key":"brokeragent@gfbio.org",
        # "emailAddress":"brokeragent@gfbio.org","avatarUrls":{"48x48":
        # "https://helpdesk.gfbio.org/secure/useravatar?ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","24x24":
        # "https://helpdesk.gfbio.org/secure/useravatar?size=small&ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","16x16":
        # "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","32x32":
        # "https://helpdesk.gfbio.org/secure/useravatar?size=medium&ownerId=
        # brokeragent%40gfbio.org&avatarId=11100"},"displayName":
        # "Broker Agent","active":true,"timeZone":"Europe/Berlin"},
        # "created":"2019-06-05T20:06:12.318+0000","size":8,
        # "content":"https://helpdesk.gfbio.org/secure/attachment/
        # 13820/test_primary_data_file"}]'

    @skip("Test against helpdesk server")
    def test_delete_attachment(self):
        # ticket_key = 'SAND-1535'
        # testing get ticket -> WORKS
        #  http://helpdesk.gfbio.org/rest/api/2/issue/SAND-1535
        # url = '{0}{1}/{2}'.format(self.base_url, HELPDESK_API_SUB_URL,
        #                           ticket_key, )
        # response = requests.get(
        #     url=url,
        #     auth=('brokeragent', ''),
        #     headers={
        #         'Content-Type': 'application/json'
        #     },
        # )
        #
        # testing get attachment -> WORKS
        # url = '{0}{1}/{2}'.format(self.base_url, '/rest/api/2/attachment',
        #                           '13791', )
        # response = requests.get(
        #     url=url,
        #     auth=('brokeragent', ''),
        #     headers={
        #         'Content-Type': 'application/json'
        #     },
        # )
        # http://helpdesk.gfbio.org/rest/api/2/attachment/13791
        # 200
        # b'{"self":"https://helpdesk.gfbio.org/rest/api/2/attachment/13791",
        # "filename":"File1.forward.fastq.gz","author":{"self":
        # "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent",
        # "key":"brokeragent@gfbio.org","name":"brokeragent","avatarUrls":
        # {"48x48":"https://helpdesk.gfbio.org/secure/useravatar?ownerId=
        # brokeragent%40gfbio.org&avatarId=11100","24x24":"https://helpdesk.
        # gfbio.org/secure/useravatar?size=small&ownerId=brokeragent%40gfbio.
        # org&avatarId=11100","16x16":"https://helpdesk.gfbio.org/secure/
        # useravatar?size=xsmall&ownerId=brokeragent%40gfbio.org&avatarId=
        # 11100","32x32":"https://helpdesk.gfbio.org/secure/useravatar?
        # size=medium&ownerId=brokeragent%40gfbio.org&avatarId=11100"},
        # "displayName":"Broker Agent","active":true},"created":
        # "2019-06-04T19:39:21.138+0000","size":66,"properties":{},
        # "content":"https://helpdesk.gfbio.org/secure/attachment/13791/
        # File1.forward.fastq.gz"}'

        # testing delete -> WORKS
        url = "{0}{1}/{2}".format(
            self.base_url,
            "/rest/api/2/attachment",
            "13791",
        )
        response = requests.delete(
            url=url,
            auth=("brokeragent", ""),
            headers={"Content-Type": "application/json"},
        )
        # http://helpdesk.gfbio.org/rest/api/2/attachment/13791
        # 204
        # b''

    @skip("Test against helpdesk server")
    def test_update_ticket_with_siteconfig(self):
        # WORKS:
        ticket_key = "SAND-1539"
        url = "{0}{1}/{2}".format(
            self.base_url,
            JIRA_ISSUE_URL,
            ticket_key,
        )
        response = requests.put(
            url=url,
            auth=("brokeragent", ""),
            headers={"Content-Type": "application/json"},
            data=json.dumps(
                {
                    # 'fields': {
                    #     'customfield_10205': 'Kevin Horsmeier',
                    #     'customfield_10216': [
                    #         {'value': 'Uncertain'},
                    #     ]
                    # }
                    "fields": {
                        # 'customfield_10010': 'sand/generic-data',
                        "customfield_10202": {
                            "self": "https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10805",
                            "value": "CC BY-NC-ND 4.0",
                            "id": "10805",
                        },
                        "issuetype": {"name": "Data Submission"},
                        "customfield_10307": "pub1",
                        "description": "remote debug 4",
                        "customfield_10208": "remote debug 4",
                        "customfield_10311": "",
                        "customfield_10303": "7e6fa310-6031-4e41-987b-271d89916eb2",
                        "customfield_10205": ",;",
                        "customfield_10216": [
                            {"value": "Sensitive Personal Information"},
                            {"value": "Uncertain"},
                        ],
                        "summary": 'remote debug 4 EDIT TITLE AGAIN Part 2 "Retur...',
                        # 'reporter': {
                        #     'name': 'No valid user, name or email available'},
                        "customfield_10313": "Algae & Protists, Zoology, Geoscience, Microbiology",
                        "project": {"key": "SAND"},
                        "customfield_10200": "2020-01-24",
                        "customfield_10314": "",
                        "customfield_10308": ["LABEL1", "label2"],
                        "customfield_10600": "",
                        "customfield_10229": [{"value": "Dublin Core"}],
                        "customfield_10201": 'remote debug 4 EDIT TITLE AGAIN Part 2 "Return of the edit"',
                    }
                }
            ),
        )
        # ######################################

        # jira = JIRA(server='http://helpdesk.gfbio.org/',
        #             basic_auth=('brokeragent', ''))
        #
        # issue = jira.issue('SAND-1539')
        # res = issue.update(notify=True, fields={
        #     'customfield_10205': 'New Name Marc Weber, Alfred E. Neumann',
        #     'customfield_10216': [
        #         {'value': 'Uncertain'},
        #         {'value': 'Nagoya Protocol'},
        #         {'value': 'Sensitive Personal Information'},
        #     ]
        # })

        # issue = jira.issue('SAND-1540')
        # res = issue.update(notify=True, fields={'summary': 'new summary Part 2',
        #                                         'description': 'A new summary was added. AGAIN'})
        pass

    @skip("Test against helpdesk server")
    @responses.activate
    def test_python_jira_500(self):
        # jira-python fires multiple requests to respective jira servers
        # mocking this one provokes a 500 exception like one to be expected on server errors

        # if mocked request does not match url python-jiras own retry policy will apply
        # e.g. get_server_info=True. Then exception is thrown

        responses.add(
            responses.GET,
            "http://helpdesk.gfbio.org/rest/api/2/field",
            json={"server_error": "mocked"},
            status=500,
        )

        options = {"server": "http://helpdesk.gfbio.org/"}

        # alternativ
        # jira = JIRA(server='http://helpdesk.gfbio.org/',
        #             basic_auth=('brokeragent', ''))

        try:
            jira = JIRA(
                options=options,
                basic_auth=("brokeragent", ""),
                max_retries=1,
                get_server_info=True,
            )
        except ConnectionError as ex:
            print("GENERIC EXCEPTION ", ex)
            print(ex.__dict__)
            print(ex.request.__dict__)
        except JIRAError as e:
            print(e.__dict__)
            print("status_code ", e.status_code)
            print("text ", e.text)
            print("response ", e.response)
            print("response. status_code ", e.response.status_code)

    @skip("Test against helpdesk server")
    @responses.activate
    def test_python_jira_400(self):
        responses.add(
            responses.GET,
            "http://helpdesk.gfbio.org/rest/api/2/field",
            json={"client_error": "mocked"},
            status=400,
        )
        options = {"server": "http://helpdesk.gfbio.org/"}

        # alternativ
        # jira = JIRA(server='http://helpdesk.gfbio.org/',
        #             basic_auth=('brokeragent', ''))

        try:
            jira = JIRA(
                options=options,
                basic_auth=("brokeragent", ""),
                max_retries=1,
                get_server_info=False,
            )
        except JIRAError as e:
            print("JIRA ERROR ", e)
        # issues = jira.search_issues('assignee="Marc Weber"')
        # issue = jira.issue('SAND-1539')

        # try:
        #     issue = jira.issue('SAND-1539xx')
        # except JIRAError as e:
        #     print(e.__dict__)
        #     print('status_code ', e.status_code)
        #     print('text ', e.text)
        #     print('response ', e.response)
        #     print('response. status_code ', e.response.status_code)

        # responses.add(responses.GET, 'http://helpdesk.gfbio.org/rest/api/2/field',
        #               json={'what': 'fake_response'}, status=500)
        # try:
        #     issue = jira.issue('SAND-1539oo')
        #     print(issue.fields.summary)
        #     print('issues ', issues)
        # except requests.exceptions.ConnectionError as e:
        #     print(e)
        # except JIRAError as e:
        #     print(e.__dict__)
        #     print('status_code ', e.status_code)
        #     print('text ', e.text)
        #     print('response ', e.response)
        #     print('response. status_code ', e.response.status_code)

    @skip("Test against pangaea servers")
    def test_pangaea_jira(self):
        rc = ResourceCredential.objects.create(
            title="t",
            url="https://ws.pangaea.de/ws/services/PanLogin",
            authentication_string="-",
            username="gfbio-broker",
            password="",
            comment="-",
        )
        login_token = get_pangaea_login_token(rc)
        cookies = dict(PanLoginID=login_token)
        print("COOKIES ", cookies)

        options = {
            "server": "https://issues.pangaea.de",
            "cookies": cookies,
        }
        jira = JIRA(options)
        print(jira)
        print("projects", jira.projects)
        # PDI-21091
        issues = jira.search_issues('assignee="brokeragent"')
        print("issues ", issues)
        issue = jira.issue("PDI-21091")
        print("issue ", issue.fields.summary)

    @skip("Test against helpdesk server")
    def test_python_jira_create(self):
        jira = JIRA(server="http://helpdesk.gfbio.org/", basic_auth=("brokeragent", ""))

        # almost analog to gfbio_prepare_create_helpdesk_payload(...)
        issue_dict = {
            "project": {"key": "SAND"},
            "summary": "New issue from jira-python",
            "description": "Look into this one",
            "issuetype": {"name": "Data Submission"},
            "reporter": {"name": "maweber@mpi-bremen.de"},
            "assignee": {"name": "maweber@mpi-bremen.de"},  # or data center
            "customfield_10010": "sand/molecular-data",
            "customfield_10200": "{0}".format((datetime.date.today() + datetime.timedelta(days=365)).isoformat()),
            "customfield_10201": "requirements title",
            "customfield_10208": "requirements description",
            "customfield_10303": "7fafa310-6031-4e41-987b-271d89916eb2",
            # 'customfield_10311': requirements.get('data_collection_time', ''),
            "customfield_10308": [
                "LABEL1",
                "label2",
            ],
            "customfield_10313": ", ".join(["Algae & Protists", "Microbiology"]),
            "customfield_10205": "first_name,last_name;email",
            "customfield_10307": "; ".join(["publication 1234"]),
            "customfield_10216": [{"value": l} for l in ["Sensitive Personal Information", "Uncertain"]],
            "customfield_10314": "potential project id",
            "customfield_10202": {
                "self": "https://helpdesk.gfbio.org/rest/api/2/customFieldOption/10500",
                "value": "other",
                "id": "10500",
            },
            "customfield_10600": "http://www.downloadurl.com",
            "customfield_10229": [{"value": "other"}],
        }
        try:
            new_issue = jira.create_issue(fields=issue_dict)
            # SAND-1540
            # works : https://helpdesk.gfbio.org/projects/SAND/queues/custom/21/SAND-1540
            # <class 'jira.resources.Issue'>
        except JIRAError as e:
            pass
            # # 400
            # {"errorMessages":[],"errors":{"Metadata Description":"data was
            # not an array","customfield_10202":"Could not find valid 'id' or
            # 'value' in the Parent Option object."}}

        # new_issue = jira.create_issue(
        #     project='PROJ_key_or_id',
        #     summary='New issue from jira-python',
        #     description='Look into this one',
        #     issuetype={'name': 'Bug'}
        # )

    @skip("Test against helpdesk server")
    def test_python_jira_update(self):
        jira = JIRA(server="http://helpdesk.gfbio.org/", basic_auth=("brokeragent", ""))
        issue = jira.issue("SAND-1543")
        print(issue)
        # comments = jira.comments(issue)
        # issue.update(summary='new summary', description='A new summary was added')

        # res = issue.update(notify=False, fields={'summary': 'new summary',
        #                                    'description': 'A new summary was added'})
        # jira.exceptions.JIRAError: JiraError HTTP 403 url: https://helpdesk.gfbio.org/rest/api/2/issue/16035?notifyUsers=false
        # 	text: To discard the user notification either admin or project admin permissions are required.

        res = issue.update(
            notify=True,
            fields={"summary": "new summary", "description": "A new summary was added"},
        )

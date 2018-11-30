# -*- coding: utf-8 -*-
import base64
import copy
import csv
import io
import json
import os
import pprint
import textwrap
import uuid
import xml
from collections import defaultdict, OrderedDict
from json import JSONDecodeError
from unittest import skip
from urllib.parse import urlparse
from uuid import uuid4, UUID

import jsonschema
import requests
import responses
from celery import chain
from django.conf import settings
from django.core.urlresolvers import reverse
from django.db.utils import IntegrityError
from django.test import TestCase
from django.utils.encoding import smart_bytes, smart_text
from mock import patch
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase, APIClient

from config.settings.base import MEDIA_URL
from gfbio_submissions.brokerage.configuration.settings import \
    HELPDESK_API_SUB_URL, HELPDESK_COMMENT_SUB_URL
from gfbio_submissions.users.models import User
from .configuration.settings import PANGAEA_ISSUE_BASE_URL, \
    SUBMISSION_DELAY
from .models import Submission, \
    ResourceCredential, BrokerObject, RequestLog, PersistentIdentifier, \
    SiteConfiguration, AdditionalReference, TaskProgressReport, \
    TicketLabel, SubmissionFileUpload, PrimaryDataFile, AuditableTextData, \
    CenterName
from .serializers import SubmissionSerializer, \
    SubmissionDetailSerializer
from .tasks import create_helpdesk_ticket_task, \
    create_broker_objects_from_submission_data_task, \
    transfer_data_to_ena_task, process_ena_response_task, \
    comment_helpdesk_ticket_task, \
    request_pangaea_login_token_task, create_pangaea_jira_ticket_task, \
    attach_file_to_pangaea_ticket_task, comment_on_pangaea_ticket_task, \
    check_for_pangaea_doi_task, \
    add_pangaealink_to_helpdesk_ticket_task, trigger_submission_transfer, \
    check_on_hold_status_task, get_gfbio_user_email_task, \
    prepare_ena_submission_data_task, attach_file_to_helpdesk_ticket_task
from .utils.ena import send_submission_to_ena, \
    download_submitted_run_files_to_stringIO, prepare_ena_data, \
    store_ena_data_as_auditable_text_data, Enalizer
from .utils.gfbio import \
    gfbio_assemble_research_object_id_json, gfbio_site_object_ids_service, \
    gfbio_helpdesk_create_ticket, \
    gfbio_helpdesk_comment_on_ticket, gfbio_get_user_by_id, \
    gfbio_helpdesk_attach_file_to_ticket
from .utils.pangaea import \
    request_pangaea_login_token, parse_pangaea_login_token_response, \
    get_pangaea_login_token, get_csv_from_sample, get_csv_from_samples, \
    create_pangaea_jira_ticket
from .utils.submission_transfer import \
    SubmissionTransferHandler


class ResourceCredentialTest(TestCase):
    fixtures = ('user', 'broker_object', 'submission', 'resource_credential',)

    def test_instance(self):
        resource_credentiales = ResourceCredential.objects.all()
        self.assertIsInstance(resource_credentiales[0], ResourceCredential)

    def test_str(self):
        resource_credential = ResourceCredential.objects.all().first()
        self.assertEqual('The-Test', resource_credential.__str__())


class SiteConfigurationTest(TestCase):
    fixtures = (
        'user', 'resource_credential', 'site_configuration', 'ticket_label',)

    def test_create(self):
        conf = SiteConfiguration.objects.create(
            title='Title',
            site=User.objects.get(pk=1),
            ena_server=ResourceCredential.objects.get(pk=1),
            pangaea_server=ResourceCredential.objects.get(pk=2),
            gfbio_server=ResourceCredential.objects.get(pk=1),
            helpdesk_server=ResourceCredential.objects.get(pk=2),
            comment='Comment'
        )
        self.assertIsInstance(conf, SiteConfiguration)
        self.assertIsInstance(conf.site, User)
        self.assertIsInstance(conf.ena_server, ResourceCredential)
        self.assertIsInstance(conf.pangaea_server, ResourceCredential)
        self.assertIsInstance(conf.gfbio_server, ResourceCredential)
        self.assertIsInstance(conf.helpdesk_server, ResourceCredential)
        self.assertFalse(conf.release_submissions)

    def test_str(self):
        conf = SiteConfiguration.objects.create(
            title='Title',
            site=User.objects.get(pk=1),
            ena_server=ResourceCredential.objects.get(pk=1),
            pangaea_server=ResourceCredential.objects.get(pk=2),
            gfbio_server=ResourceCredential.objects.get(pk=1),
            helpdesk_server=ResourceCredential.objects.get(pk=2),
            comment='Comment'
        )
        self.assertEqual('Title', conf.__str__())

    def test_fixture(self):
        conf = SiteConfiguration.objects.get(pk=1)
        self.assertEqual('fixture1', conf.title)

    def test_get_site_configuration_for_task(self):
        site_config = SiteConfiguration.objects.get_site_configuration_for_task(
            site=User.objects.get(pk=1)
        )
        self.assertEqual('fixture1', site_config.title)
        self.assertFalse(site_config.release_submissions)

    # FIXME: add fixture to be imported on fresh db via manage.py
    def test_get_site_config_without_site(self):
        site_config = SiteConfiguration.objects.get_site_configuration_for_task(
            site=None
        )
        self.assertEqual('default', site_config.title)
        self.assertFalse(site_config.release_submissions)
        self.assertIsNone(site_config.site)

    def test_get_site_config_without_site_or_default(self):
        site_config = SiteConfiguration.objects.get(pk=2)
        site_config.delete()
        with self.assertRaises(SiteConfiguration.DoesNotExist) as exc:
            site_config = SiteConfiguration.objects.get_site_configuration_for_task(
                site=None
            )

    def test_get_ticket_labels(self):
        site_config = SiteConfiguration.objects.get(pk=1)
        labels = site_config.get_ticket_labels(
            label_type=TicketLabel.PANGAEA_JIRA)
        self.assertEqual(2, len(labels))
        self.assertTrue(isinstance(labels, list))
        for l in labels:
            self.assertTrue(isinstance(l, str))


class TicketLabelTest(TestCase):
    fixtures = ('user', 'resource_credential', 'site_configuration',)

    def test_instance(self):
        labels = TicketLabel.objects.all()
        self.assertEqual(0, len(labels))
        l = TicketLabel()
        l.site_configuration = SiteConfiguration.objects.get(pk=1)
        l.label_type = 'P'
        l.label = 'Label this !'
        l.save()
        labels = TicketLabel.objects.all()
        self.assertEqual(1, len(labels))

    def test_site_configuration_labels(self):
        sc = SiteConfiguration.objects.get(pk=1)

        l = TicketLabel()
        l.site_configuration = sc
        l.label_type = 'P'
        l.label = 'Label this !'
        l.save()

        self.assertEqual(1, len(sc.ticketlabel_set.all()))
        sc = SiteConfiguration.objects.get(pk=2)
        self.assertEqual(0, len(sc.ticketlabel_set.all()))


class BrokerObjectTest(TestCase):
    fixtures = ('user', 'broker_object', 'submission', 'resource_credential')

    @classmethod
    def _get_broker_object_test_data(cls):
        return {
            'requirements': {
                'title': '123456',
                'description': '123456',
                'study_type': 'Metagenomics',
                'samples': [
                    {
                        'sample_alias': 'sample1',
                        'sample_title': 'stitle',
                        'taxon_id': 1234
                    },
                    {
                        'sample_alias': 'sample2',
                        'sample_title': 'stitleagain',
                        'taxon_id': 1234
                    }
                ],
                "experiments": [
                    {
                        'experiment_alias': 'experiment1',
                        'platform': 'AB 3730xL Genetic Analyzer',
                        'design': {
                            'sample_descriptor': 'sample2',
                            'design_description': '',
                            'library_descriptor': {
                                'library_strategy': 'AMPLICON',
                                'library_source': 'METAGENOMIC',
                                'library_selection': 'PCR',
                                'library_layout': {
                                    'layout_type': 'paired',
                                    'nominal_length': 450
                                }
                            }
                        }
                    }
                ],
                'runs': [
                    {
                        'experiment_ref': 'experiment1',
                        'data_block': {
                            'files': [
                                {
                                    'filename': 'aFile',
                                    'filetype': 'fastq',
                                    'checksum_method': 'MD5',
                                    'checksum': '12345'
                                }
                            ]
                        }
                    }
                ]
            }
        }

    @classmethod
    def _get_ena_full_data(cls, runs=False):
        if runs:
            with open(os.path.join(
                    'gfbio_submissions/brokerage/test_data/',
                    'ena_data_full_with_runs.json'), 'r') as test_data_file:
                return json.load(test_data_file)
        else:
            with open(os.path.join(
                    'gfbio_submissions/brokerage/test_data/',
                    'ena_data_full_no_runs.json'), 'r') as test_data_file:
                return json.load(test_data_file)

    def test_instance(self):
        se = BrokerObject()
        self.assertTrue(isinstance(se, BrokerObject))

    def test_str(self):
        bo = BrokerObject.objects.all().first()
        self.assertEqual('obj001_study', bo.__str__())

    def test_save(self):
        all_entities = BrokerObject.objects.all()
        self.assertEqual(6, len(all_entities))
        se = BrokerObject()
        se.type = 'study'
        se.site = User.objects.get(pk=1)
        se.site_project_id = 'prj00001'
        se.site_object_id = 'obj0000122'
        se.save()
        all_entities = BrokerObject.objects.all()
        self.assertEqual(7, len(all_entities))

    def test_manager_add_entity(self):
        all_entities = BrokerObject.objects.all()
        self.assertEqual(6, len(all_entities))

        BrokerObject.objects.add_entity(
            Submission.objects.get(pk=1),
            'study',
            User.objects.get(pk=1),
            'prj0002',
            'obj00099999',
            {
                "center_name": "c",
                "study_type": "Metagenomics",
                "study_abstract": "abs",
                "study_title": "t",
                "study_alias": "a",
                "site_object_id": "study_obj_1"
            }
        )

        all_entities = BrokerObject.objects.all()
        self.assertEqual(7, len(all_entities))
        self.assertEqual('study', all_entities.last().type)

    def test_manager_add_submission_data_std_serializer(self):
        ena_data = self._get_ena_full_data()
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': ena_data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        self.assertEqual(22, len(broker_objects))
        self.assertEqual(16,
                         len(BrokerObject.objects.filter(site_project_id='')))
        self.assertEqual(1, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='study')))
        self.assertEqual(5, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='sample')))
        self.assertEqual(5, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='experiment')))
        self.assertEqual(5, len(
            BrokerObject.objects.filter(site_project_id='').filter(type='run')))

    def test_manager_double_add_submission_data_std_serializer(self):
        ena_data = self._get_ena_full_data()
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': ena_data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        self.assertEqual(22, len(broker_objects))
        self.assertEqual(16,
                         len(BrokerObject.objects.filter(site_project_id='')))

        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        self.assertEqual(22, len(broker_objects))
        self.assertEqual(16,
                         len(BrokerObject.objects.filter(site_project_id='')))

    def test_manager_add_submission_data_std_serializer_including_run_block(
            self):
        ena_data = self._get_ena_full_data(runs=True)
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': ena_data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        # 19 directly, plus 4 experiements tha contain 2 files each, resulting in 4 more run objects (with 2 files in data_block)
        self.assertEqual(23, len(broker_objects))
        self.assertEqual(17,
                         len(BrokerObject.objects.filter(site_project_id='')))
        self.assertEqual(1, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='study')))
        self.assertEqual(5, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='sample')))
        self.assertEqual(5, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='experiment')))
        self.assertEqual(6, len(
            BrokerObject.objects.filter(site_project_id='').filter(type='run')))

    def test_manager_double_add_submission_data_std_serializer_including_run_block(
            self):
        ena_data = self._get_ena_full_data(runs=True)
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': ena_data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        # 19 directly, plus 4 experiements tha contain 2 files each, resulting in 4 more run objects (with 2 files in data_block)
        self.assertEqual(23, len(broker_objects))
        self.assertEqual(17,
                         len(BrokerObject.objects.filter(site_project_id='')))

        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        # 19 directly, plus 4 experiements tha contain 2 files each, resulting in 4 more run objects (with 2 files in data_block)
        self.assertEqual(23, len(broker_objects))
        self.assertEqual(17,
                         len(BrokerObject.objects.filter(site_project_id='')))

    def test_add_submission_data_min_validation_full_data(self):
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': False,
                'data': TestAddSubmissionView.new_data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

    def test_add_submission_data_min_validation_min_data(self):
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

    def test_manager_add_submission_data_detail_serializer(self):
        serializer = SubmissionDetailSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': TestAddSubmissionView.new_data
            }
        )
        serializer.is_valid()
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        self.assertEqual(11, len(broker_objects))
        self.assertEqual(5,
                         len(BrokerObject.objects.filter(site_project_id='')))
        self.assertEqual(1, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='study')))
        self.assertEqual(2, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='sample')))
        self.assertEqual(1, len(
            BrokerObject.objects.filter(site_project_id='').filter(
                type='experiment')))
        self.assertEqual(1, len(
            BrokerObject.objects.filter(site_project_id='').filter(type='run')))

    def test_add_submission_data_detail_serializer_min_validation_full_data(
            self):
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

        serializer = SubmissionDetailSerializer(
            data={
                'target': 'ENA',
                'release': False,
                'data': TestAddSubmissionView.new_data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

    def test_add_submission_data_detail_serializer_min_validation_min_data(
            self):
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

        serializer = SubmissionDetailSerializer(
            data={
                'target': 'ENA',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))

    def test_manager_add_submission_data_without_ids(self):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': self._get_broker_object_test_data()
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(11, len(broker_objects))
        self.assertEqual(5, len(BrokerObject.objects.filter(
            site_project_id='')))
        broker_objects = BrokerObject.objects.filter(site_project_id='')

        for b in broker_objects:
            self.assertEqual('{}_{}'.format(b.site, b.pk), b.site_object_id)

    def test_manager_double_add_submission_data_without_ids(self):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': self._get_broker_object_test_data()
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.get(pk=1))

        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(11, len(broker_objects))
        self.assertEqual(5, len(BrokerObject.objects.filter(
            site_project_id='')))
        broker_objects = BrokerObject.objects.filter(site_project_id='')
        for b in broker_objects:
            self.assertEqual('{}_{}'.format(b.site, b.pk), b.site_object_id)

        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(11, len(broker_objects))
        self.assertEqual(5, len(BrokerObject.objects.filter(
            site_project_id='')))
        broker_objects = BrokerObject.objects.filter(site_project_id='')

    def test_manager_add_submission_data_invalid_aliases(self):
        data = copy.deepcopy(TestAddSubmissionView.new_data)
        data['requirements']['experiments'][0]['design'][
            'sample_descriptor'] = 'xxx'

        serializer = SubmissionSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        data['requirements']['experiments'][0]['study_ref'] = 'xxx'
        serializer = SubmissionSerializer(data=data)
        self.assertFalse(serializer.is_valid())

        data['requirements']['runs'][0]['experiment_ref'] = 'xxx'
        serializer = SubmissionSerializer(data=data)
        self.assertFalse(serializer.is_valid())

    def test_double_add_empty_site_object_id(self):
        all_entities = BrokerObject.objects.all()
        self.assertEqual(6, len(all_entities))
        obj = BrokerObject.objects.add_entity(
            Submission.objects.get(pk=1),
            'study',
            User.objects.get(pk=1),
            'prj0002',
            '',
            {
                "center_name": "no_valid_center",
                "study_type": "Metagenomics",
                "study_abstract": "abs",
                "study_title": "t",
                "study_alias": "a",
                "site_object_id": "study_obj_1"
            }
        )
        all_entities = BrokerObject.objects.all()
        self.assertEqual(7, len(all_entities))
        BrokerObject.objects.add_entity(
            Submission.objects.get(pk=1),
            'study',
            User.objects.get(pk=1),
            'prj0002',
            obj.site_object_id,
            {
                "center_name": "nice_valid_center",
                "study_type": "Metagenomics",
                "study_abstract": "abs",
                "study_title": "t",
                "study_alias": "a",
                "site_object_id": "study_obj_1"
            }
        )
        all_entities = BrokerObject.objects.all()
        self.assertEqual(7, len(all_entities))

    def test_double_add_same_site_object_id(self):
        obj = BrokerObject.objects.add_entity(
            Submission.objects.get(pk=1),
            'study',
            User.objects.get(pk=1),
            'prj0002',
            'obj00099999',
            {
                "center_name": "no_valid_center",
                "study_type": "Metagenomics",
                "study_abstract": "abs",
                "study_title": "t",
                "study_alias": "a",
                "site_object_id": "study_obj_1"
            }
        )
        all_entities = BrokerObject.objects.all()
        self.assertEqual(7, len(all_entities))
        obj = BrokerObject.objects.add_entity(
            Submission.objects.get(pk=1),
            'study',
            User.objects.get(pk=1),
            'prj0002',
            'obj00099999',
            {
                "center_name": "nice_valid_center",
                "study_type": "Metagenomics",
                "study_abstract": "abs",
                "study_title": "t",
                "study_alias": "a",
                "site_object_id": "study_obj_1"
            }
        )
        all_entities = BrokerObject.objects.all()
        self.assertEqual(7, len(all_entities))

    @skip('right now there is no natural-key and unique constraint available')
    def test_unique_natural_keys(self):
        se = BrokerObject()
        se.type = 'study'
        se.site = User.objects.get(pk=1)
        se.site_project_id = 'prj00001'
        se.site_object_id = 'obj0000122'
        se.save()
        all_entities = BrokerObject.objects.all()
        self.assertEqual(6, len(all_entities))

        se2 = BrokerObject()
        se2.type = 'study'
        se2.site = User.objects.get(pk=1)
        se2.site_project_id = 'prj00001'
        se2.site_object_id = 'obj0000122'
        with self.assertRaises(IntegrityError) as exc:
            se2.save()

    @skip('right now there is no natural-key and unique constraint available')
    def test_get_by_natural_key(self):
        se = BrokerObject()
        se.type = 'study'
        se.site = User.objects.get(pk=1)
        se.site_project_id = 'prj00001'
        se.site_object_id = 'obj0000122'
        se.save()

        se = BrokerObject()
        se.type = 'study'
        se.site = User.objects.get(pk=1)
        se.site_project_id = 'prj00001'
        se.site_object_id = 'obj0000123'
        se.save()

        obj = BrokerObject.objects.get_by_natural_key(
            type='study',
            site=User.objects.get(pk=1),
            site_project_id='prj00001',
            site_object_id='obj0000123'
        )

        self.assertEqual(se.id, obj.pk)

    def test_append_persistent_identifier(self):
        bo = BrokerObject.objects.all().first()
        self.assertEqual(0, len(bo.persistentidentifier_set.all()))
        study = {
            'accession': 'ERP013438',
            'alias': '1:f844738b-3304-4db7-858d-b7e47b293bb2',
            'holdUntilDate': '2016-03-05Z',
            'status': 'PRIVATE'
        }
        obj = BrokerObject.objects.append_persistent_identifier(
            study, 'ENA', 'ACC')
        self.assertEqual(1, len(bo.persistentidentifier_set.all()))

    def test_append_pid_with_corrupt_alias(self):
        bo = BrokerObject.objects.all().first()
        self.assertEqual(0, len(bo.persistentidentifier_set.all()))
        study = {
            'accession': 'ERP013438',
            'alias': '666:f844738b-3304-4db7-858d-b7e47b293bb2',
            'holdUntilDate': '2016-03-05Z',
            'status': 'PRIVATE'
        }
        obj = BrokerObject.objects.append_persistent_identifier(
            study, 'ENA', 'ACC')
        self.assertIsNone(obj)
        self.assertEqual(0, len(bo.persistentidentifier_set.all()))

    def test_append_pids_from_ena_response(self):
        parsed = {'errors': [],
                  'experiments': [{'accession': 'ERX1228437',
                                   'alias': '4:f844738b-3304-4db7-858d-b7e47b293bb2',
                                   'status': 'PRIVATE'}],
                  'infos': [
                      'ADD action for the following XML: study.xml sample.xml            experiment.xml run.xml'],
                  'receipt_date': '2015-12-01T11:54:55.723Z',
                  'runs': [{'accession': 'ERR1149402',
                            'alias': '5:f844738b-3304-4db7-858d-b7e47b293bb2',
                            'status': 'PRIVATE'}],
                  'samples': [{'accession': 'ERS989691',
                               'alias': '2:f844738b-3304-4db7-858d-b7e47b293bb2',
                               'ext_ids': [{'accession': 'SAMEA3682542',
                                            'type': 'biosample'},
                                           {'accession': 'SAMEA3682543-666',
                                            'type': 'sample-this'}],
                               'status': 'PRIVATE'},
                              {'accession': 'ERS989692',
                               'alias': '3:f844738b-3304-4db7-858d-b7e47b293bb2',
                               'ext_ids': [{'accession': 'SAMEA3682543',
                                            'type': 'biosample'}],
                               'status': 'PRIVATE'}],
                  'study': {'accession': 'ERP013438',
                            'alias': '1:f844738b-3304-4db7-858d-b7e47b293bb2',
                            'holdUntilDate': '2016-03-05Z',
                            'status': 'PRIVATE'},
                  'success': 'true'}
        objs = BrokerObject.objects.append_pids_from_ena_response(parsed)
        self.assertEqual(8, len(objs))
        d = defaultdict(int)
        for o in objs:
            d[o.pid_type] += 1
        self.assertEqual(5, d['ACC'])
        self.assertEqual(3, d['BSA'])

    def test_add_pids_from_submitted_run_files(self):
        study = BrokerObject.objects.filter(type='study').first()
        self.assertEqual(0, len(study.persistentidentifier_set.all()))
        with open(os.path.join(
                'gfbio_submissions/brokerage/test_data/',
                'short_submitted_run_files.txt'), 'r') as test_data_file:
            res = BrokerObject.objects.add_downloaded_pids_to_existing_broker_objects(
                study_pid='ERP019479', decompressed_file=test_data_file)
        study = BrokerObject.objects.filter(type='study').first()
        self.assertEqual(1, len(study.persistentidentifier_set.all()))


class CenterNameTest(TestCase):

    def test_instance(self):
        cn = CenterName()
        cn.center_name = 'A Center'
        cn.save()
        self.assertEqual('A Center', cn.center_name)
        self.assertEqual(1, len(CenterName.objects.all()))

    def test_default(self):
        cn = CenterName()
        self.assertEqual('GFBIO', cn.center_name)

    def test_str(self):
        cn, created = CenterName.objects.get_or_create(center_name='ABC')
        self.assertTrue(created)
        self.assertEqual(1, len(CenterName.objects.all()))
        self.assertEqual('ABC', cn.__str__())


# https://code.djangoproject.com/ticket/27675
# https://bitbucket.org/schinckel/django-jsonfield/issues/57/cannot-use-in-the-same-project-as-djangos
# https://code.djangoproject.com/ticket/27183
class SubmissionTest(TestCase):
    fixtures = (
        'user', 'submission', 'resource_credential', 'site_configuration',
    )

    content_without_runs = {
        'requirements': {
            'title': '123456',
            'description': '123456',
            'study_type': 'Metagenomics',
            'samples': [
                {
                    'sample_alias': 'sample1',
                    'sample_title': 'stitle',
                    'taxon_id': 530564
                },
                {
                    'sample_alias': 'sample2',
                    'sample_title': 'stitleagain',
                    'taxon_id': 530564
                }
            ],
            "experiments": [
                {
                    'experiment_alias': 'experiment1',
                    'platform': 'AB 3730xL Genetic Analyzer',
                    'design': {
                        'sample_descriptor': 'sample2',
                        'design_description': '',
                        'library_descriptor': {
                            'library_strategy': 'AMPLICON',
                            'library_source': 'METAGENOMIC',
                            'library_selection': 'PCR',
                            'library_layout': {
                                'layout_type': 'paired',
                                'nominal_length': 450
                            }
                        }
                    },
                    "files": {
                        "forward_read_file_name": "File3.forward.fastq.gz",
                        "reverse_read_file_name": "File3.reverse.fastq.gz",
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1"
                    }
                }
            ]
        }
    }

    content_with_runs = {
        'requirements': {
            'title': '123456',
            'description': '123456',
            'study_type': 'Metagenomics',
            'samples': [
                {
                    'sample_alias': 'sample1',
                    'sample_title': 'stitle',
                    'taxon_id': 530564
                },
                {
                    'sample_alias': 'sample2',
                    'sample_title': 'stitleagain',
                    'taxon_id': 530564
                }
            ],
            "experiments": [
                {
                    'experiment_alias': 'experiment1',
                    'platform': 'AB 3730xL Genetic Analyzer',
                    'design': {
                        'sample_descriptor': 'sample2',
                        'design_description': '',
                        'library_descriptor': {
                            'library_strategy': 'AMPLICON',
                            'library_source': 'METAGENOMIC',
                            'library_selection': 'PCR',
                            'library_layout': {
                                'layout_type': 'paired',
                                'nominal_length': 450
                            }
                        }
                    },
                    "files": {
                        "forward_read_file_name": "File3.forward.fastq.gz",
                        "reverse_read_file_name": "File3.reverse.fastq.gz",
                        "forward_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1",
                        "reverse_read_file_checksum": "197bb2c9becec16f66dc5cf9e1fa75d1"
                    }
                },
                {
                    'experiment_alias': 'experiment2',
                    'platform': 'AB 3730xL Genetic Analyzer',
                    'design': {
                        'sample_descriptor': 'sample1',
                        'design_description': '',
                        'library_descriptor': {
                            'library_strategy': 'AMPLICON',
                            'library_source': 'METAGENOMIC',
                            'library_selection': 'PCR',
                            'library_layout': {
                                'layout_type': 'paired',
                                'nominal_length': 450
                            }
                        }
                    }
                }
            ],
            "runs": [
                {
                    "experiment_ref": "experiment2",
                    "data_block": {
                        "files": [
                            {
                                "filename": "aFile",
                                "filetype": "fastq",
                                "checksum_method": "MD5",
                                "checksum": "12345"
                            }
                        ]
                    }
                }
            ]
        }
    }

    def _prepare_entities_without_runs(self, create_broker_objects=True):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': self.content_without_runs
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.get(pk=1))
        if create_broker_objects:
            BrokerObject.objects.add_submission_data(submission)
        return submission

    @classmethod
    def _prepare_entities_with_runs(cls, create_broker_objects=True):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': cls.content_with_runs
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.get(pk=1))
        if create_broker_objects:
            BrokerObject.objects.add_submission_data(submission)
        return submission

    def test_create_empty_submission(self):
        all_submissions = Submission.objects.all()
        self.assertEqual(5, len(all_submissions))
        sub = Submission()
        sub.site = User.objects.get(pk=1)
        sub.save()
        all_submissions = Submission.objects.all()
        self.assertEqual(6, len(all_submissions))

    def test_centername_none(self):
        sub = Submission.objects.first()
        self.assertIsNone(sub.center_name)

    def test_centername(self):
        cn, created = CenterName.objects.get_or_create(center_name='ABCD')
        sub = Submission.objects.first()
        sub.center_name = cn
        sub.save()
        self.assertEqual(cn, sub.center_name)
        self.assertEqual('ABCD', sub.center_name.center_name)

    def test_ids_on_empty_submission(self):
        all_submissions = Submission.objects.all()
        submission_count = len(all_submissions)
        sub = Submission()
        pre_save_bsi = sub.broker_submission_id
        sub.save()
        self.assertEqual(pre_save_bsi, sub.broker_submission_id)
        self.assertEqual(sub.pk, sub.id)
        all_submissions = Submission.objects.all()
        post_save_count = len(all_submissions)
        self.assertEqual(post_save_count, submission_count + 1)

    def test_get_study_json(self):
        sub = self._prepare_entities_without_runs()
        ena_study = {
            'study_title': self.content_without_runs.get('requirements')[
                'title'],
            'study_abstract': self.content_without_runs.get('requirements')[
                'description'],
            'study_type': self.content_without_runs.get('requirements')[
                'study_type']
        }
        self.assertDictEqual(ena_study, sub.get_study_json())

    def test_get_sample_json(self):
        sub = self._prepare_entities_without_runs()
        content_samples = self.content_without_runs.get('requirements').get(
            'samples')
        for s in sub.get_sample_json().get('samples'):
            self.assertIn(s, content_samples)

    def test_get_experiment_json_with_files(self):
        sub = self._prepare_entities_without_runs()
        content_experiments = self.content_without_runs.get('requirements').get(
            'experiments')
        # pop out "new" site_object_ids from
        [c.pop('site_object_id') for c in content_experiments]
        for s in sub.get_experiment_json().get('experiments'):
            self.assertIn(s, content_experiments)
            self.assertTrue('files' in s.keys())

    def test_get_experiment_json_with_files_and_run(self):
        sub = self._prepare_entities_with_runs()
        content_experiments = self.content_with_runs.get('requirements').get(
            'experiments')
        # pop out "new" site_object_ids from
        [c.pop('site_object_id') for c in content_experiments]
        for s in sub.get_experiment_json().get('experiments'):
            s.pop('site_object_id')
            self.assertIn(s, content_experiments)
            if s['experiment_alias'] == 'experiment1':
                self.assertTrue('files' in s.keys())
            else:
                self.assertFalse('files' in s.keys())

    def test_get_run_json_with_files_in_experiment(self):
        sub = self._prepare_entities_without_runs()
        content_runs = self.content_without_runs.get('requirements').get('runs',
                                                                         [])
        self.assertEqual(0, len(content_runs))
        self.assertEqual(1, len(sub.get_run_json().get('runs')))

    def test_get_run_json_with_additional_files_in_experiment(self):
        sub = self._prepare_entities_with_runs()
        content_runs = self.content_with_runs.get('requirements').get('runs')
        self.assertEqual(1, len(content_runs))
        self.assertEqual(2, len(sub.get_run_json().get('runs')))

    def test_get_json_with_aliases_with_file_in_experiment(self):
        sub = self._prepare_entities_without_runs()
        request_id_fake = uuid.UUID('71d59109-695d-4172-a8be-df6fb3283857')
        study, samples, experiments, runs = sub.get_json_with_aliases(
            alias_postfix=request_id_fake)
        study_alias = study.get('study_alias', None)
        sample_aliases = [s.get('sample_alias', '') for s in
                          samples]
        experiment_aliases = [e.get('experiment_alias', '') for e in
                              experiments]
        experiment_sample_descriptors = [
            e.get('design', {}).get('sample_descriptor', '') for e in
            experiments]
        experiment_study_refs = [e.get('study_ref', '') for e in
                                 experiments]
        run_experiment_refs = [r.get('experiment_ref') for r in
                               runs]

        for e in experiment_sample_descriptors:
            self.assertIn(e, sample_aliases)
            self.assertTrue(2, len(e.split(':')))
        for e in experiment_study_refs:
            self.assertEqual(e, study_alias)
            self.assertTrue(2, len(e.split(':')))
        self.assertEqual(1, len(experiment_aliases))
        self.assertEqual(1, len(run_experiment_refs))

    def test_get_json_with_aliases_with_additional_files_in_experiment(self):
        sub = self._prepare_entities_with_runs()
        request_id_fake = uuid.UUID('71d59109-695d-4172-a8be-df6fb3283857')
        study, samples, experiments, runs = sub.get_json_with_aliases(
            alias_postfix=request_id_fake)
        study_alias = study.get('study_alias', None)
        sample_aliases = [s.get('sample_alias', '') for s in
                          samples]
        experiment_aliases = [e.get('experiment_alias', '') for e in
                              experiments]
        experiment_sample_descriptors = [
            e.get('design', {}).get('sample_descriptor', '') for e in
            experiments]
        experiment_study_refs = [e.get('study_ref', '') for e in
                                 experiments]
        run_experiment_refs = [r.get('experiment_ref') for r in
                               runs]

        for e in experiment_sample_descriptors:
            self.assertIn(e, sample_aliases)
            self.assertTrue(2, len(e.split(':')))
        for e in experiment_study_refs:
            self.assertEqual(e, study_alias)
            self.assertTrue(2, len(e.split(':')))
        self.assertEqual(2, len(experiment_aliases))
        self.assertEqual(2, len(run_experiment_refs))
        for r in run_experiment_refs:
            self.assertIn(r, experiment_aliases)
            self.assertTrue(2, len(e.split(':')))

    def test_get_submission_instance(self):
        submission_bsis = Submission.objects.all().values_list(
            'broker_submission_id')
        submission = Submission.objects.get_submission_instance(
            '4ceeae16-c114-4d3f-ba0b-225b9d5e4abf')
        self.assertIn((submission.broker_submission_id,), submission_bsis)

        submission = Submission.objects.get_submission_instance(
            '4ceeae16-c114-4d3f-ba0b-225b9d5e4fff')
        self.assertIsInstance(submission, Submission)
        self.assertNotIn((submission.broker_submission_id,), submission_bsis)

    def test_str(self):
        submission = Submission.objects.all().first()
        self.assertEqual('1_{0}'.format(submission.broker_submission_id),
                         submission.__str__())

    def test_status_after_trigger_submission(self):
        conf = SiteConfiguration.objects.get(site=User.objects.get(pk=1))
        conf.release_submissions = True
        conf.save()

        sub = Submission.objects.get(pk=1)
        old_status = sub.status
        result = trigger_submission_transfer.apply_async(
            kwargs={
                'submission_id': sub.pk,
            },
            countdown=SUBMISSION_DELAY
        )
        sub = Submission.objects.get(pk=1)
        # TODO: refactor or delete this test, trigger task is not manipulating submission
        self.assertEqual(old_status, sub.status)

    def test_queuing_of_closed_submissions(self):
        with patch(
                'gfbio_submissions.brokerage.tasks.trigger_submission_transfer.apply_async') as trigger_mock:
            sub = Submission()
            sub.site = User.objects.get(pk=1)
            sub.status = Submission.CLOSED
            sub.save()
            self.assertEqual(Submission.CLOSED, sub.status)
            trigger_mock.assert_not_called()

    def test_get_submission_for_task(self):
        sub = Submission()
        sub.site = User.objects.get(pk=1)
        sub.save()
        id = sub.pk
        self.assertEqual(Submission.OPEN, sub.status)
        sub = Submission.objects.get_submission_for_task(id=id)
        self.assertEqual(Submission.OPEN, sub.status)

        sub.status = Submission.CLOSED
        sub.save()

        with self.assertRaises(Submission.DoesNotExist) as exc:
            sub = Submission.objects.get_submission_for_task(id=id)

        sub = Submission.objects.get(pk=id)
        sub.status = Submission.ERROR
        sub.save()
        with self.assertRaises(Submission.DoesNotExist) as exc:
            sub = Submission.objects.get_submission_for_task(id=id)

        sub = Submission.objects.get(pk=id)
        sub.status = Submission.OPEN
        sub.save()
        with self.assertRaises(Submission.DoesNotExist) as exc:
            sub = Submission.objects.get_submission_for_task(id=id + 12)


# TODO: clean or remove this mess. most is obsolete
class FullWorkflowTest(TestCase):
    fixtures = ('user', 'submission', 'resource_credential')

    # TODO: use existing Taxon: Pirellula staleyi DSM 6068 (no rank) 530564
    # curl -v -X POST -d 'account=maweber&submitting_user=HORST&site_project_id=p1&sample={"samples": [{"taxon_id": 1, "sample_alias": "sample_alias_1", "sample_title": "x", "site_object_id": "sample_obj_1"}, {"taxon_id": 2, "sample_alias": "sample_alias_2", "sample_title": "xx", "site_object_id": "sample_obj_2"}]}&study={"center_name": "c", "study_type": "Metagenomics", "study_abstract": "abs", "study_title": "t", "study_alias": "a", "site_object_id": "study_obj_1"}&experiment={"experiments":[{"experiment_alias":"experiment_alias_1", "study_ref": "a", "experiment_title":"exp1", "design":{"sample_descriptor": "sample_alias_1", "library_descriptor":{"library_strategy":"WGS - Whole Genome Sequencing - random sequencing of the whole genome (see pubmed 10731132 for details)", "library_source":"METAGENOMIC - Mixed material from metagenome.", "library_selection": "RANDOM - No selection or random selection.", "library_layout": "Single"}},"platform":{}, "site_object_id": "experiment_obj_1"}]}&run={}' "http://maweber:test@127.0.0.1:8000/brokerage/submissions/ena"
    @classmethod
    def _prepare(self):
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': BrokerObjectTest._get_ena_full_data()
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.get(pk=1))
        BrokerObject.objects.add_submission_data(submission)

        return submission

    def test_prepare(self):
        sub = self._prepare()
        self.assertIsInstance(sub, Submission)

    # FIXME: this test works when started alone, relying on broker object ids
    # 1,2,3,4,5 but when started with other tests of this file the ids range
    # from 6 - 10 because one testrun created one database where autoincremented
    # ids are taking the next highest number available, even if lower number
    # are free at this point of time.
    @skip(
        'this test works when started alone, relying on broker object ids. fix this')
    def test_full_workflow(self):
        sub = self._prepare()
        submissions = Submission.objects.all()

        broker_objects = BrokerObject.objects.all()
        persistent_identifiers = PersistentIdentifier.objects.all()
        request_logs = RequestLog.objects.all()

        # associated_transfers = AssociatedTransfer.objects.all()
        # 5 from fixture, 1 from _prepare_entities
        self.assertEqual(6, len(submissions))
        # FullWorkflowTest._prepare has release set to true, thus submitted
        self.assertEqual('SUBMITTED', sub.status)
        # 1 study, 3 samples, 1 experiment, 1 run from _prepare_entities
        # New: 1 study 5 samples 5 experimente, 0 runs but files in each experiemnt = 5
        self.assertEqual(16, len(broker_objects))
        # 0 because no submission yet
        self.assertEqual(0, len(persistent_identifiers))
        # 0 requests yet, not even incoming since we do _prepare_entities
        self.assertEqual(0, len(request_logs))
        # 0 associated transfers because no submission yes
        # self.assertEqual(0, len(associated_transfers))

        response = requests.models.Response()
        response.status_code = 200
        response._content = textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
            <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
                     success="true">
                <EXPERIMENT accession="ERX1228437" alias="4:f844738b-3304-4db7-858d-b7e47b293bb2"
                            status="PRIVATE"/>
                <RUN accession="ERR1149402" alias="5:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"/>
                <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                    <EXT_ID accession="SAMEA3682542" type="biosample"/>
                    <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
                </SAMPLE>
                <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                    <EXT_ID accession="SAMEA3682543" type="biosample"/>
                </SAMPLE>
                <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
                       holdUntilDate="2016-03-05Z"/>
                <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
                <MESSAGES>
                    <INFO>ADD action for the following XML: study.xml sample.xml
                        experiment.xml run.xml
                    </INFO>
                </MESSAGES>
                <ACTIONS>ADD</ACTIONS>
                <ACTIONS>ADD</ACTIONS>
                <ACTIONS>ADD</ACTIONS>
                <ACTIONS>ADD</ACTIONS>
                <ACTIONS>HOLD</ACTIONS>
            </RECEIPT>""")
        with patch('requests.get', return_value=response) as r:
            pass
            # transfer = SubmissionTransfer.objects.get(pk=2)
            # same instance in db but with ena specific python code
            # transfer = EnaSubmissionTransfer.objects.get(pk=2)
            # transfer.execute(sub)
            # r.assert_called_with('http://www.example.com')

        submissions = Submission.objects.all()
        broker_objects = BrokerObject.objects.all()
        persistent_identifiers = PersistentIdentifier.objects.all()
        request_logs = RequestLog.objects.all()
        # associated_transfers = AssociatedTransfer.objects.all()
        # 5 from fixture, 1 from _prepare_entities
        self.assertEqual(6, len(submissions))
        # 1 study, 3 samples, 1 experiment, 1 run from _prepare_entities
        # New: 1 study 5 samples 5 experimente, 0 runs but files in each experiemnt = 5
        self.assertEqual(16, len(broker_objects))

        # FIXME: mocked xml response is not corresponding to new testdata
        # 5 acc (1 study, 2 samples, 1 experiment, 1 run) plus 3 biosample
        self.assertEqual(8, len(persistent_identifiers))
        # 1 request for sending data only to one archive, with successful response
        self.assertEqual(1, len(request_logs))
        # 1 associated transfers for sending to one archive
        # self.assertEqual(1, len(associated_transfers))

        self.assertEqual('closed', sub.status)

    # TODO: this test needs some adaptions, mock_response and celery-eager
    @skip('obsolete, needs modifications')
    def test_ena_response_with_errors(self):
        sub = self._prepare()
        self.assertEqual('open', sub.status)
        response = requests.models.Response()
        response.status_code = 200
        response._content = textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
<RECEIPT receiptDate="2015-12-09T10:14:46.195Z" submissionFile="submission.xml" success="false"><SUBMISSION alias="ADD_SUBMISSION_ALIAS"/><MESSAGES><ERROR> Submission with name ADD_SUBMISSION_ALIAS already exists</ERROR><INFO> ADD action for the following XML: study.xml sample.xml experiment.xml run.xml       </INFO></MESSAGES><ACTIONS>ADD</ACTIONS><ACTIONS>ADD</ACTIONS><ACTIONS>ADD</ACTIONS><ACTIONS>ADD</ACTIONS><ACTIONS>HOLD</ACTIONS></RECEIPT>""")
        with patch('requests.get', return_value=response) as r:
            transfer = SubmissionTransferHandler(submission_id=sub.pk)
            transfer.execute()
            r.assert_called_with('http://www.example.com')
        self.assertEqual('open', sub.status)
        request_log = RequestLog.objects.all().first()
        self.assertIn('parsed_ena_response', request_log.request_details.keys())

    @skip('request against testserver')
    def test_send_submission_to_ena(self):
        study = {"study_alias": "study_alias_0", "study_title": "stitle",
                 "center_name": "cname", "study_abstract": "abstr",
                 "study_type": "Metagenomics", 'study_alias': 'sref', }
        sample = {
            'samples': [
                {
                    'gcdjson_key': 'gcdjson_12',
                    'sample_alias': 'sample_alias_1',
                    'scientific_name': 'sc name',
                    'sample_description': 'blbbllblllalllblalbla',
                    'common_name': 'c name', 'individual_name': 'in name',
                    'gcdjson': {'env_feature': 'feat', 'project_name': 'p_name',
                                'assembly': {'assembly_method': 'Celera',
                                             'calculation_method': 'met',
                                             'estimated_error_rate': 22},
                                'submitted_to_insdc': True, 'seq_meth': 's_met',
                                'package': 'air',
                                'collection_date': '2015-03-06T12:00:40+01:00',
                                'checklist': 'me', 'env_package': 'air',
                                'env_biome': 'desert',
                                'filter_type': ['chemical air filter', 'HEPA'],
                                'investigation_type': 'virus',
                                'gcdj_version': '0.0.0',
                                'geo_loc_name': 'Germany:Sylt:Westerland',
                                'alt': {'unit': 'm', 'value': 344},
                                'env_material': 'mat',
                                'lat_lon': {'latitude': 34.02,
                                            'longitude': 0.99}},
                    'site_object_id': 'obj1', 'taxon_id': 1,
                    'sample_title': 'title', 'sample_attributes': [
                    {'units': 'u1', 'tag': 't1', 'value': 'v1'},
                    {'units': 'u2', 'tag': 't2', 'value': 'v2'},
                    {'units': 'u3', 'tag': 't3', 'value': 'v3'}],
                    'anonymized_name': 'a name'},

                {'taxon_id': 2, 'sample_title': 'zwei',
                 'site_object_id': 'obj2', 'sample_alias': 'sample_alias_2'},

                {'taxon_id': 3, 'sample_title': 'drei',
                 'site_object_id': 'obj3', 'sample_alias': 'sample_alias_2',
                 'gcdjson': {'env_feature': 'feat', 'project_name': 'p_name',
                             'assembly': {'assembly_method': 'Celera',
                                          'calculation_method': 'met',
                                          'estimated_error_rate': 22},
                             'submitted_to_insdc': True, 'seq_meth': 's_met',
                             'package': 'air',
                             'collection_date': '2015-03-06T12:00:40+01:00',
                             'checklist': 'me', 'env_package': 'air',
                             'env_biome': 'desert',
                             'filter_type': ['chemical air filter', 'HEPA'],
                             'investigation_type': 'virus',
                             'gcdj_version': '0.0.0',
                             'geo_loc_name': 'Germany:Sylt:Westerland',
                             'alt': {'unit': 'm', 'value': 344},
                             'env_material': 'mat',
                             'lat_lon': {'latitude': 34.02, 'longitude': 0.99}}}
            ]}

        # from widget with "new" experiment schema
        # manually modified study_ref+sample_ref to match study_alias above
        experiment = {
            "experiments": [
                {
                    "experiment_alias": "experiment_alias_1",
                    "title": "exp_adv1",
                    "design": {
                        "sample_descriptor": "sample_alias_1",
                        "design_description": "desc1",
                        "library_descriptor": {
                            "library_strategy": "WGS",
                            "library_source": "METAGENOMIC",
                            "library_selection": "RANDOM",
                            "library_layout": "Single"}
                    },
                    # TODO: schema4 would allow better checks for model
                    # TODO: find a way to perform a platform specific check on model, especially in widget
                    "platform": {
                        "platform_type": "LS454",
                        "ls454": "454 GS 20"
                    },
                    "study_ref": "sref"
                }
            ]
        }
        run = {
            "runs": [
                {
                    "title": "rtitle1",
                    "experiment_ref": "experiment_alias_1",
                    "run_alias": "run_alias_1"
                }
            ]
        }

        data = {
            'submitting_user': 'aUser',
            'site_project_id': 'prjX',
            'study': study,
            'sample': sample,
            'experiment': experiment,
            'run': run
        }

        # validate and save submission data
        serializer = SubmissionSerializer(data=data)
        valid = serializer.is_valid()
        # self.assertTrue(valid)

        submission = serializer.save(site=User.objects.get(pk=1))

        resource_credential = ResourceCredential()
        resource_credential.title = 'test-srv'
        resource_credential.url = 'https://www-test.ebi.ac.uk/ena/submit/drop-box/submit/'
        resource_credential.authentication = 'ENA Webin-40945 aKS5hJ_Vj-Uacwd5'
        resource_credential.save()
        # --------- above delievers submission and submission data objects as in view
        # TODO: execute this to check !
        sth = SubmissionTransferHandler(submission_id=submission.pk)
        sth.execute_submission_to_ena()

    # NEW: curl -v -X POST -d 'account=maweber&submitting_user=HORST&site_project_id=p1&sample={"samples": [{"taxon_id": 1, "sample_alias": "sample_alias_1", "sample_title": "x", "site_object_id": "sample_obj_1"}, {"taxon_id": 2, "sample_alias": "sample_alias_2", "sample_title": "xx", "site_object_id": "sample_obj_2"}]}&study={"center_name": "c", "study_type": "Metagenomics", "study_abstract": "abs", "study_title": "t", "study_alias": "a", "site_object_id": "study_obj_1"}&experiment={"experiments":[{"experiment_alias":"experiment_alias_1", "study_ref": "a", "experiment_title":"exp1", "design":{"sample_descriptor": "sample_alias_1", "library_descriptor":{"library_strategy":"WGS - Whole Genome Sequencing - random sequencing of the whole genome (see pubmed 10731132 for details)", "library_source":"METAGENOMIC - Mixed material from metagenome.", "library_selection": "RANDOM - No selection or random selection.", "library_layout": "Single"}},"platform":{}, "site_object_id": "experiment_obj_1"}]}&run={}' "http://maweber:test@127.0.0.1:8000/brokerage/submissions/ena"
    # for local test start celery deamon/worker, beat, cam, then rename celery.py and run test
    @skip('test against debug server, that needs to be up and running')
    def test_post_to_debug_server_ena_submission(self):
        # let form validation fail
        # self.content['sample'] = 2
        # access existing submission
        # self.content['broker_submission_id'] = 'cdd73460-eec7-40a3-9a1f-f0a314f821f3'
        # change site_project_id
        # self.content['site_project_id'] = 'p8'

        # explicit error for testing, change in submission data via admin before release on hold
        # platform = FAIL

        response = requests.post(
            url='http://127.0.0.1:8000/brokerage/submissions/ena',
            data=json.dumps(self.content),
            headers={
                'Authorization': 'Token e4501de7f37d3044778f7939155f90cfb1625c6e',
                'Content-Type': 'application/json'}
        )

    @skip('test against GWDG')
    def test_post_to_gwdg_server(self):
        # let form validation fail
        # self.content['sample'] = 2
        # access existing submission
        # self.content['broker_submission_id'] = 'cdd73460-eec7-40a3-9a1f-f0a314f821f3'
        # change site_project_id
        # self.content['site_project_id'] = 'p8'

        response = requests.post(
            url='http://c103-170.cloud.gwdg.de/brokerage/submissions/ena',
            data=json.dumps(self.content),
            headers={
                'Authorization': 'Token 95bf481b2262df60953c31604a585450445880af',
                'Content-Type': 'application/json'}
        )

    # @skip('test against GWDG')
    def test_https_post_to_gfbio_submissions_server(self):
        # study = {"study_alias": "study_alias_0", "study_title": "stitle",
        #          "center_name": "cname", "study_abstract": "abstr",
        #          "study_type": "Metagenomics", 'study_alias': 'sref', }
        # sample = {
        #     'samples': [
        #         {
        #             'gcdjson_key': 'gcdjson_12',
        #             'sample_alias': 'sample_alias_1',
        #             'scientific_name': 'sc name',
        #             'sample_description': 'blbbllblllalllblalbla',
        #             'common_name': 'c name', 'individual_name': 'in name',
        #             'gcdjson': {'env_feature': 'feat', 'project_name': 'p_name',
        #                         'assembly': {'assembly_method': 'Celera',
        #                                      'calculation_method': 'met',
        #                                      'estimated_error_rate': 22},
        #                         'submitted_to_insdc': True, 'seq_meth': 's_met',
        #                         'package': 'air',
        #                         'collection_date': '2015-03-06T12:00:40+01:00',
        #                         'checklist': 'me', 'env_package': 'air',
        #                         'env_biome': 'desert',
        #                         'filter_type': ['chemical air filter', 'HEPA'],
        #                         'investigation_type': 'virus',
        #                         'gcdj_version': '0.0.0',
        #                         'geo_loc_name': 'Germany:Sylt:Westerland',
        #                         'alt': {'unit': 'm', 'value': 344},
        #                         'env_material': 'mat',
        #                         'lat_lon': {'latitude': 34.02,
        #                                     'longitude': 0.99}},
        #             'site_object_id': 'obj1', 'taxon_id': 412755,
        #             'sample_title': 'title', 'sample_attributes': [
        #             {'units': 'u1', 'tag': 't1', 'value': 'v1'},
        #             {'units': 'u2', 'tag': 't2', 'value': 'v2'},
        #             {'units': 'u3', 'tag': 't3', 'value': 'v3'}],
        #             'anonymized_name': 'a name'},
        #
        #         {'taxon_id': 412755, 'sample_title': 'zwei',
        #          'site_object_id': 'obj2', 'sample_alias': 'sample_alias_2'},
        #
        #         {'taxon_id': 412755, 'sample_title': 'drei',
        #          'site_object_id': 'obj3', 'sample_alias': 'sample_alias_2',
        #          'gcdjson': {'env_feature': 'feat', 'project_name': 'p_name',
        #                      'assembly': {'assembly_method': 'Celera',
        #                                   'calculation_method': 'met',
        #                                   'estimated_error_rate': 22},
        #                      'submitted_to_insdc': True, 'seq_meth': 's_met',
        #                      'package': 'air',
        #                      'collection_date': '2015-03-06T12:00:40+01:00',
        #                      'checklist': 'me', 'env_package': 'air',
        #                      'env_biome': 'desert',
        #                      'filter_type': ['chemical air filter', 'HEPA'],
        #                      'investigation_type': 'virus',
        #                      'gcdj_version': '0.0.0',
        #                      'geo_loc_name': 'Germany:Sylt:Westerland',
        #                      'alt': {'unit': 'm', 'value': 344},
        #                      'env_material': 'mat',
        #                      'lat_lon': {'latitude': 34.02, 'longitude': 0.99}}}
        #     ]}

        # from widget with "new" experiment schema
        # manually modified study_ref+sample_ref to match study_alias above
        # experiment = {
        #     "experiments": [
        #         {
        #             "experiment_alias": "experiment_alias_1",
        #             "title": "exp_adv1",
        #             "design": {
        #                 "sample_descriptor": "sample_alias_1",
        #                 "design_description": "desc1",
        #                 "library_descriptor": {
        #                     "library_strategy": "WGS",
        #                     "library_source": "METAGENOMIC",
        #                     "library_selection": "RANDOM",
        #                     "library_layout": "Single"}
        #             },
        #             # TODO: schema4 would allow better checks for model
        #             # TODO: find a way to perform a platform specific check on model, especially in widget
        #             "platform": {
        #                 "platform_type": "LS454",
        #                 "ls454": "454 GS 20"
        #             },
        #             "study_ref": "sref"
        #         }
        #     ]
        # }
        # run = {
        #     "runs": [
        #         {
        #             "title": "rtitle1",
        #             "experiment_ref": "experiment_alias_1",
        #             "run_alias": "run_alias_1"
        #         }
        #     ]
        # }
        #
        # data = {
        #     'submitting_user': 'maweber',
        #     'site_project_id': 'prjX',
        #     'study': study,
        #     'sample': sample,
        #     'experiment': experiment,
        #     'run': run
        # }

        # TODO: this crashes on production server
        # stop supervisor, start server  with regular command for output, run this test -> json expeption
        # sentry: https://sentry.io/jacobs-university-bremen/gfbioservices/issues/729833620/?query=is:unresolved
        # docs https://docs.djangoproject.com/en/1.11/ref/request-response/#django.http.HttpResponse.content
        test_data = copy.deepcopy(TestAddSubmissionView.new_data)
        pprint.pprint(test_data)
        test_data['requirements'].pop('runs')
        pprint.pprint(test_data)
        response = requests.post(
            url='https://submission.gfbio.org/api/submissions/',
            # url='https://services.gfbio.org/api/submissions/',
            data=json.dumps(
                {
                    'target': 'ENA_PANGAEA',
                    'release': True,
                    'data': test_data
                }
            ),
            headers={
                'Authorization': 'Token 0df34a33fc12b18432830ea81aa3af2cab2e532a',
                # 'Authorization':
                #    'Token 167ed8501cb0a3e7770f09df6d3e3e14a3489475',
                'Content-Type': 'application/json'}
        )

        print(response.content)
        try:
            pprint.pprint(json.loads(response.content.decode('utf-8')))
        except JSONDecodeError as e:
            print('Error ', e)
        print(response.status_code)


class PersistentIdentifierTest(TestCase):
    fixtures = ('user', 'submission', 'broker_object', 'persistent_identifier',)

    def test_str(self):
        p = PersistentIdentifier.objects.all().first()
        self.assertEqual('ACC_1234', p.__str__())


class RequestLogTest(TestCase):
    fixtures = ('user', 'submission', 'resource_credential')

    def test_add_request_log_entry(self):
        submission = Submission.objects.all().first()
        all_entries = RequestLog.objects.all()
        self.assertEqual(0, len(all_entries))
        request_log = RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data='{"some_data": 12345}',
            site_user='jdoe',
            submission_id=submission.broker_submission_id,
            response_status=200,
            response_content='Whatever we return',
        )
        all_entries = RequestLog.objects.all()
        self.assertEqual(1, len(all_entries))

    def test_str(self):
        submission = Submission.objects.all().first()
        request_log = RequestLog.objects.create(
            type=RequestLog.INCOMING,
            data='{"some_data": 12345}',
            site_user='jdoe',
            submission_id=submission.broker_submission_id,
            response_status=200,
            response_content='Whatever we return',
        )
        self.assertIsInstance(request_log.__str__(), str)


class EnalizerTest(TestCase):
    fixtures = (
        'user', 'submission', 'resource_credential', 'site_configuration')

    @classmethod
    def _get_test_data(cls, runs=False):
        if runs:
            with open(os.path.join(
                    'gfbio_submissions/brokerage/test_data/',
                    'ena_data_full_with_runs.json'), 'r') as test_data_file:
                test_data = {
                    'target': 'ENA',
                    'release': True,
                    'data': json.load(test_data_file)
                }
        else:
            with open(os.path.join(
                    'gfbio_submissions/brokerage/test_data/',
                    'ena_data_full_no_runs.json'), 'r') as test_data_file:
                test_data = {
                    'target': 'ENA',
                    'release': True,
                    'data': json.load(test_data_file)
                }
        study = {
            'study_alias': 'fake_id:0123234234',
            'study_title': test_data['data']['requirements']['title'],
            'study_abstract': test_data['data']['requirements']['description'],
            'study_type': test_data['data']['requirements']['study_type']
        }
        return study, \
               test_data['data']['requirements']['samples'], \
               test_data['data']['requirements']['experiments'], \
               test_data['data']['requirements'].get('runs', [])

    @classmethod
    def _get_submission_with_testdata(cls, runs=False,
                                      add_sample_attributes=False,
                                      add_invalid_package=False):
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': BrokerObjectTest._get_ena_full_data(runs=runs)
            }
        )
        serializer.is_valid()
        submission = serializer.save(site=User.objects.get(pk=1))
        if add_sample_attributes:
            submission.data['requirements']['samples'][0][
                'sample_attributes'] = [
                {"tag": "investigation type", "value": "mimarks-survey"},
                {"tag": "environmental package", "value": "water"},
                {"tag": "collection date", "value": "2014-11"},
            ]
            submission.data['requirements']['samples'][1][
                'sample_attributes'] = [
                {"tag": "environmental package", "value": "wastewater sludge"},
            ]
        if add_invalid_package:
            submission.data['requirements']['samples'][0][
                'sample_attributes'] = [
                {"tag": "investigation type", "value": "mimarks-survey"},
                {"tag": "environmental package", "value": "coffee"},
                {"tag": "collection date", "value": "2014-11"},
            ]
        submission.save()
        BrokerObject.objects.add_submission_data(submission)
        return submission

    def test_instance_with_files_in_experiments(self):
        sub = self._get_submission_with_testdata()
        e = Enalizer(sub, alias_postfix='test')
        self.assertTrue(isinstance(e, Enalizer))
        self.assertTrue(e.study_alias.endswith(':test'))
        self.assertEqual(e.study_alias, e.experiment[0]['study_ref'])
        self.assertEqual(5, len(e.run))

    def test_instance_with_additional_files_in_experiments(self):
        sub = self._get_submission_with_testdata(runs=True)
        e = Enalizer(sub, alias_postfix='test-runs')
        self.assertTrue(isinstance(e, Enalizer))
        self.assertTrue(e.study_alias.endswith(':test-runs'))
        self.assertEqual(e.study_alias, e.experiment[0]['study_ref'])
        self.assertEqual(6, len(e.run))

    def test_instance_center_name(self):
        sub = self._get_submission_with_testdata()
        e = Enalizer(sub, alias_postfix='test')
        self.assertEqual('GFBIO', e.center_name)

        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        sub.center_name = center_name
        sub.save()

        e2 = Enalizer(sub, alias_postfix='test')
        self.assertEqual('CustomCenter', e2.center_name)

    def test_study_xml(self):
        sub = self._get_submission_with_testdata()
        ena = Enalizer(sub, 'test-enalizer-study')
        data = ena.prepare_submission_data()
        k, study_xml = data.get('STUDY')
        self.assertEqual('study.xml', k)
        self.assertIn('<STUDY_SET>', study_xml)
        self.assertIn('<STUDY', study_xml)
        self.assertIn('<DESCRIPTOR>', study_xml)
        self.assertIn('<STUDY_TYPE', study_xml)
        self.assertIn('<STUDY_TITLE>', study_xml)
        self.assertIn('<STUDY_ABSTRACT>', study_xml)
        study_xml_standalone = ena.create_study_xml()
        self.assertEqual(study_xml, smart_text(study_xml_standalone))

    def test_study_xml_center_name(self):
        sub = self._get_submission_with_testdata()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        sub.center_name = center_name
        sub.save()
        ena = Enalizer(sub, 'test-enalizer-study')
        data = ena.prepare_submission_data()
        k, study_xml = data.get('STUDY')
        self.assertEqual('study.xml', k)
        self.assertIn('center_name="CustomCenter"', study_xml)
        study_xml_standalone = ena.create_study_xml()
        self.assertEqual(study_xml, smart_text(study_xml_standalone))

    def test_sample_xml(self):
        # BrokerObject.objects.all().delete()
        sub = self._get_submission_with_testdata()
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()

        k, sample_xml = data.get('SAMPLE')
        sxml = xml.dom.minidom.parseString(sample_xml)
        s = sxml.toprettyxml()
        self.assertEqual('sample.xml', k)
        submission_samples = sub.brokerobject_set.filter(type='sample')
        # works
        # self.assertIn(bytes('<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO"><TITLE>Sample No. 1</TITLE><SAMPLE_NAME><TAXON_ID>1234</TAXON_ID></SAMPLE_NAME><DESCRIPTION>A description, with commmas, ...</DESCRIPTION><SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES>'
        #               '</SAMPLE>'.format(submission_samples[0].pk), 'utf-8'), sample_xml)
        # works
        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO"><TITLE>Sample No. 1</TITLE><SAMPLE_NAME><TAXON_ID>1234</TAXON_ID></SAMPLE_NAME><DESCRIPTION>A description, with commmas, ...</DESCRIPTION><SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES>'
            '</SAMPLE>'.format(submission_samples[0].pk),
            sample_xml)

        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO"><TITLE>Sample No. 2</TITLE><SAMPLE_NAME><TAXON_ID>1234</TAXON_ID></SAMPLE_NAME><DESCRIPTION /><SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES>'
            '</SAMPLE>'.format(submission_samples[1].pk),
            sample_xml)

        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO"><TITLE>Sample No. 3</TITLE><SAMPLE_NAME><TAXON_ID>1234</TAXON_ID></SAMPLE_NAME><DESCRIPTION>A description, with commmas, ...</DESCRIPTION><SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES>'
            '</SAMPLE>'.format(submission_samples[2].pk),
            sample_xml)

        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO"><TITLE>Sample No. 4</TITLE><SAMPLE_NAME><TAXON_ID>1234</TAXON_ID></SAMPLE_NAME><DESCRIPTION>A description, with commmas, ...</DESCRIPTION><SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES>'
            '</SAMPLE>'.format(submission_samples[3].pk),
            sample_xml)

        self.assertIn(
            '<SAMPLE alias="{0}:test-enalizer-sample" broker_name="GFBIO" center_name="GFBIO"><TITLE>Sample No. 5</TITLE><SAMPLE_NAME><TAXON_ID>1234</TAXON_ID></SAMPLE_NAME><DESCRIPTION>A description, with commmas, ...</DESCRIPTION><SAMPLE_ATTRIBUTES><SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE></SAMPLE_ATTRIBUTE><SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE></SAMPLE_ATTRIBUTES>'
            '</SAMPLE>'.format(submission_samples[4].pk),
            sample_xml)

    def test_sample_xml_center_name(self):
        sub = self._get_submission_with_testdata()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        sub.center_name = center_name
        sub.save()
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()

        k, sample_xml = data.get('SAMPLE')
        sxml = xml.dom.minidom.parseString(sample_xml)
        self.assertEqual('sample.xml', k)
        self.assertIn('center_name="CustomCenter"', sample_xml)

    def test_sample_xml_checklist_mapping(self):
        sub = self._get_submission_with_testdata(add_sample_attributes=True)
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        sxml = xml.dom.minidom.parseString(sample_xml)
        s = sxml.toprettyxml()
        self.assertIn(
            '<SAMPLE_ATTRIBUTE><TAG>ENA-CHECKLIST</TAG><VALUE>ERC000024</VALUE></SAMPLE_ATTRIBUTE>',
            sample_xml)
        self.assertIn(
            '<SAMPLE_ATTRIBUTE><TAG>ENA-CHECKLIST</TAG><VALUE>ERC000023</VALUE></SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_additional_renamed_checklist_attribute(self):
        sub = self._get_submission_with_testdata(add_sample_attributes=True)
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertIn('<TAG>water environmental package</TAG>', sample_xml)
        self.assertIn(
            '<TAG>wastewater sludge environmental package</TAG>',
            sample_xml
        )

    def test_sample_xml_checklist_mapping_no_package(self):
        sub = self._get_submission_with_testdata(add_sample_attributes=False)
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        sxml = xml.dom.minidom.parseString(sample_xml)
        s = sxml.toprettyxml()
        self.assertNotIn('<TAG>ENA-CHECKLIST</TAG>', sample_xml)

    def test_additional_no_renamed_checklist_attribute(self):
        sub = self._get_submission_with_testdata(add_sample_attributes=False)
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertNotIn('<TAG>water environmental package</TAG>', sample_xml)
        self.assertNotIn(
            '<TAG>wastewater sludge environmental package</TAG>',
            sample_xml
        )

    def test_sample_xml_checklist_mapping_wrong_package(self):
        sub = self._get_submission_with_testdata(add_invalid_package=True)
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        sxml = xml.dom.minidom.parseString(sample_xml)
        s = sxml.toprettyxml()
        self.assertNotIn('<TAG>ENA-CHECKLIST</TAG>', sample_xml)

    def test_add_insdc_attribute(self):
        sub = self._get_submission_with_testdata()
        ena = Enalizer(sub, 'test-enalizer-sample')
        data = ena.prepare_submission_data()
        k, sample_xml = data.get('SAMPLE')
        self.assertEqual(5, sample_xml.count(
            '<SAMPLE_ATTRIBUTE><TAG>submitted to insdc</TAG><VALUE>true</VALUE>'))

    def test_experiment_xml(self):
        sub = self._get_submission_with_testdata()
        ena = Enalizer(sub, 'test-enalizer-experiment')
        self.assertFalse(ena.experiments_contain_files)
        data = ena.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        sxml = xml.dom.minidom.parseString(experiment_xml)
        s = sxml.toprettyxml()
        self.assertEqual('experiment.xml', k)
        submission_experiments = sub.brokerobject_set.filter(type='experiment')
        submission_study = sub.brokerobject_set.filter(type='study').first()
        submission_samples = sub.brokerobject_set.filter(type='sample')
        for i in range(4):
            self.assertIn(
                '<EXPERIMENT alias="{0}:test-enalizer-experiment" broker_name="GFBIO" center_name="GFBIO"><STUDY_REF refname="{1}:test-enalizer-experiment" /><DESIGN><DESIGN_DESCRIPTION /><SAMPLE_DESCRIPTOR refname="{2}:test-enalizer-experiment" /><LIBRARY_DESCRIPTOR><LIBRARY_STRATEGY>AMPLICON</LIBRARY_STRATEGY><LIBRARY_SOURCE>METAGENOMIC</LIBRARY_SOURCE><LIBRARY_SELECTION>PCR</LIBRARY_SELECTION><LIBRARY_LAYOUT><PAIRED NOMINAL_LENGTH="420" /></LIBRARY_LAYOUT></LIBRARY_DESCRIPTOR></DESIGN><PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>'
                '</EXPERIMENT>'.format(submission_experiments[i].pk,
                                       submission_study.pk,
                                       submission_samples[i].pk),
                experiment_xml)

        self.assertTrue(ena.experiments_contain_files)

    def test_experiment_xml_center_name(self):
        sub = self._get_submission_with_testdata()
        center_name, created = CenterName.objects.get_or_create(
            center_name='CustomCenter')
        sub.center_name = center_name
        sub.save()
        ena = Enalizer(sub, 'test-enalizer-experiment')
        self.assertFalse(ena.experiments_contain_files)
        data = ena.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        sxml = xml.dom.minidom.parseString(experiment_xml)
        self.assertEqual('experiment.xml', k)
        self.assertIn('center_name="CustomCenter"', experiment_xml)
        self.assertTrue(ena.experiments_contain_files)

    def test_add_experiment_platform_as_sample_attribute(self):
        sub = self._get_submission_with_testdata(add_sample_attributes=True)
        ena = Enalizer(sub, 'test-enalizer-experiment')
        data = ena.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        k, sample_xml = data.get('SAMPLE')
        self.assertIn(
            '<PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>',
            experiment_xml)

        self.assertIn(
            '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_add_experiment_platform_without_initial_sample_attributes(self):
        sub = self._get_submission_with_testdata()
        ena = Enalizer(sub, 'test-enalizer-experiment')
        data = ena.prepare_submission_data()
        k, experiment_xml = data.get('EXPERIMENT')
        k, sample_xml = data.get('SAMPLE')
        self.assertIn(
            '<PLATFORM><ILLUMINA><INSTRUMENT_MODEL>Illumina HiSeq 1000</INSTRUMENT_MODEL></ILLUMINA></PLATFORM>',
            experiment_xml)
        self.assertIn(
            '<SAMPLE_ATTRIBUTE><TAG>sequencing method</TAG><VALUE>Illumina HiSeq 1000</VALUE></SAMPLE_ATTRIBUTE>',
            sample_xml)

    def test_run_xml_with_files_in_experiment(self):
        sub = self._get_submission_with_testdata(runs=False)
        ena = Enalizer(sub, 'test-enalizer-run')
        self.assertFalse(ena.experiments_contain_files)
        data = ena.prepare_submission_data()
        self.assertTrue(ena.experiments_contain_files)

        k, run_xml = data.get('RUN')
        sxml = xml.dom.minidom.parseString(run_xml)
        s = sxml.toprettyxml()

    def test_run_xml_with_additional_files_in_experiment(self):
        sub = self._get_submission_with_testdata(runs=True)
        ena = Enalizer(sub, 'test-enalizer-run')
        self.assertFalse(ena.experiments_contain_files)
        data = ena.prepare_submission_data()
        self.assertTrue(ena.experiments_contain_files)

        run_xml = ena.create_run_xml()
        sxml = xml.dom.minidom.parseString(run_xml)

    @skip('just debugging and testing of output for comparison')
    def test_xml_output(self):

        sub = self._get_submission_with_testdata()
        ena = Enalizer(sub, 'test-enalizer')

        data = ena.prepare_submission_data()

        k, study_xml = data.get('STUDY')
        sxml = xml.dom.minidom.parseString(study_xml)
        s = sxml.toprettyxml()

        # ena = Enalizer(
        #     study_json=study,
        #     sample_json=sample,
        #     experiment_json=experiment,
        #     run_json={},
        # )
        # data = ena.prepare_submission_data()
        # k, samle_xml = data.get('SAMPLE')
        # sxml = xml.dom.minidom.parseString(samle_xml)
        # s = sxml.toprettyxml()
        # print s

        # exp_xml = ena.create_study_xml()
        # print 'study:'
        # exml = xml.dom.minidom.parseString(exp_xml)
        # e = exml.toprettyxml()
        # print e
        # print '-------------------------------------------'
        # print 'sample'
        # exp_xml = ena.create_sample_xml()
        # exml = xml.dom.minidom.parseString(exp_xml)
        # e = exml.toprettyxml()Bor
        # print e
        # print '-------------------------------------------'
        # print 'experiment'
        # exp_xml = ena.create_experiment_xml()
        # # print 'run'
        # # exp_xml = ena.create_run_xml()
        # exml = xml.dom.minidom.parseString(exp_xml)
        # e = exml.toprettyxml()
        # print e

    def test_submission_data_content(self):
        sub = self._get_submission_with_testdata(runs=False)
        ena = Enalizer(submission=sub, alias_postfix='outgoing-uuid')
        ena_submission_data = ena.prepare_submission_data(
            broker_submission_id=sub.broker_submission_id)  # ADD
        self.assertListEqual(sorted(['RUN', 'SAMPLE', 'STUDY', 'EXPERIMENT']),
                             sorted(list(ena_submission_data.keys())))
        self.assertNotIn('SUBMISSION', ena_submission_data.keys())

    def test_submission_alias(self):
        sub = self._get_submission_with_testdata(runs=False)
        ena = Enalizer(submission=sub, alias_postfix='outgoing-uuid')
        test_id = uuid4()
        submission_xml = ena.prepare_submission_xml_for_sending(
            action='ADD',
            outgoing_request_id=test_id)
        k, v = submission_xml
        self.assertEqual('submission.xml', k)
        self.assertIn('alias="{0}"'.format(test_id), v)

    @responses.activate
    def test_send_submission_to_ena(self):
        sub = FullWorkflowTest._prepare()
        conf = SiteConfiguration.objects.get(title='default')
        responses.add(
            responses.POST, conf.ena_server.url, status=200,
            body=textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
                 <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
                          success="true">
                     <EXPERIMENT accession="ERX1228437" alias="4:f844738b-3304-4db7-858d-b7e47b293bb2"
                                 status="PRIVATE"/>
                     <RUN accession="ERR1149402" alias="5:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"/>
                     <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                         <EXT_ID accession="SAMEA3682542" type="biosample"/>
                         <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
                     </SAMPLE>
                     <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                         <EXT_ID accession="SAMEA3682543" type="biosample"/>
                     </SAMPLE>
                     <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
                            holdUntilDate="2016-03-05Z"/>
                     <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
                     <MESSAGES>
                         <INFO>ADD action for the following XML: study.xml sample.xml
                             experiment.xml run.xml
                         </INFO>
                     </MESSAGES>
                     <ACTIONS>ADD</ACTIONS>
                     <ACTIONS>ADD</ACTIONS>
                     <ACTIONS>ADD</ACTIONS>
                     <ACTIONS>ADD</ACTIONS>
                     <ACTIONS>HOLD</ACTIONS>
                 </RECEIPT>"""))

        ena_submission_data = prepare_ena_data(
            submission=sub)
        response, req_log_request_id = send_submission_to_ena(
            submission=sub,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )
        self.assertEqual(req_log_request_id, RequestLog.objects.get(
            request_id=req_log_request_id).request_id)
        self.assertEqual(200, response.status_code)

    @responses.activate
    def test_send_submission_to_ena_without_run_or_experiment(self):
        sub = FullWorkflowTest._prepare()
        conf = SiteConfiguration.objects.get(title='default')
        responses.add(
            responses.POST, conf.ena_server.url, status=200,
            body=textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
                     <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
                              success="true">
                         <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                             <EXT_ID accession="SAMEA3682542" type="biosample"/>
                             <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
                         </SAMPLE>
                         <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                             <EXT_ID accession="SAMEA3682543" type="biosample"/>
                         </SAMPLE>
                         <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
                                holdUntilDate="2016-03-05Z"/>
                         <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
                         <MESSAGES>
                             <INFO>ADD action for the following XML: study.xml sample.xml
                             </INFO>
                         </MESSAGES>
                         <ACTIONS>ADD</ACTIONS>
                         <ACTIONS>ADD</ACTIONS>
                         <ACTIONS>ADD</ACTIONS>
                         <ACTIONS>ADD</ACTIONS>
                         <ACTIONS>HOLD</ACTIONS>
                     </RECEIPT>"""))

        ena_submission_data = prepare_ena_data(
            submission=sub)
        ena_submission_data.pop('EXPERIMENT')
        ena_submission_data.pop('RUN')
        response, req_log_request_id = send_submission_to_ena(
            submission=sub,
            archive_access=conf.ena_server,
            ena_submission_data=ena_submission_data,
        )
        self.assertEqual(req_log_request_id, RequestLog.objects.get(
            request_id=req_log_request_id).request_id)
        self.assertEqual(200, response.status_code)

    def test_prepare_ena_data_add(self):
        sub = FullWorkflowTest._prepare()
        enalizer = Enalizer(submission=sub,
                            alias_postfix=sub.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending(
            action='ADD')
        self.assertIn('<ADD', xml)

    def test_prepare_ena_data_validate(self):
        sub = FullWorkflowTest._prepare()
        enalizer = Enalizer(submission=sub,
                            alias_postfix=sub.broker_submission_id)
        file_name, xml = enalizer.prepare_submission_xml_for_sending()
        self.assertIn('<VALIDATE', xml)


class PangaeaTicketTest(TestCase):
    fixtures = (
        'user', 'submission', 'resource_credential', 'additional_reference',
        'site_configuration', 'ticket_label',)

    @skip('request to PANGAEA server')
    def test_basic_soap_call_for_token(self):
        username = 'gfbio-broker'
        password = 'h_qB-RxCY)7y'
        url = 'https://ws.pangaea.de/ws/services/PanLogin'
        headers = {
            'Accept': 'text/xml',
            'SOAPAction': 'login'
        }
        body = textwrap.dedent("""<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:java:de.pangaea.login.PanLogin">
  <soapenv:Header/>
  <soapenv:Body>
    <urn:login>
      <urn:username>{0}</urn:username>
      <urn:password>{1}</urn:password>
    </urn:login>
  </soapenv:Body>
</soapenv:Envelope>""".format(username, password))
        response = requests.post(url=url, data=body, headers=headers)

        # 22.02.2016 returned :
        # status:  200
        # content:  <?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>

    @skip('request to PANGAEA server')
    def test_request_pangaea_login_token(self):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'h_qB-RxCY)7y'
        access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        access.save()
        response = request_pangaea_login_token(resource_credential=access)
        self.assertTrue(200, response.status_code)
        self.assertIn(
            'xmlns:ns1="urn:java:de.pangaea.login.PanLogin">'
            '<loginReturn xsi:type="xsd:string">', response.content
        )

    def test_parse_pangaea_soap_response(self):
        # compare test above
        expected_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
        response = requests.models.Response()
        response.status_code = 200
        response._content = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope ' \
                            'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' \
                            'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' \
                            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' \
                            '<soapenv:Body><ns1:loginResponse ' \
                            'soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" ' \
                            'xmlns:ns1="urn:java:de.pangaea.login.PanLogin">' \
                            '<loginReturn xsi:type="xsd:string">{}' \
                            '</loginReturn></ns1:loginResponse></soapenv:Body>' \
                            '</soapenv:Envelope>'.format(expected_token)
        with patch('requests.post', return_value=response):
            parsed_token = parse_pangaea_login_token_response(response)
            self.assertEqual(expected_token, parsed_token)

    def test_get_pangaea_login_token(self):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'blabla'
        access.save()
        expected_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'
        response = requests.models.Response()
        response.status_code = 200
        response._content = '<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope ' \
                            'xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" ' \
                            'xmlns:xsd="http://www.w3.org/2001/XMLSchema" ' \
                            'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' \
                            '<soapenv:Body><ns1:loginResponse ' \
                            'soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" ' \
                            'xmlns:ns1="urn:java:de.pangaea.login.PanLogin">' \
                            '<loginReturn xsi:type="xsd:string">{}' \
                            '</loginReturn></ns1:loginResponse></soapenv:Body>' \
                            '</soapenv:Envelope>'.format(expected_token)
        with patch('requests.post', return_value=response):
            self.assertTrue(expected_token, get_pangaea_login_token(access))

    # TODO: clarify how to proceed with pangaea and or contetual data
    @skip('Currently no gcdj in testdata ...')
    def test_get_csv_from_sample(self):
        sub = FullWorkflowTest._prepare()
        # get samples related to submission as done in send_to_pangaea
        samples = sub.brokerobject_set.filter(type='sample')
        # GCDJ ?                  yes                          no                          yes
        # <QuerySet [<BrokerObject: obj1_sample>, <BrokerObject: obj2_sample>, <BrokerObject: obj3_sample>]>
        contains_gcdjson, csv = get_csv_from_sample(samples[1].data)
        self.assertFalse(contains_gcdjson)
        self.assertEqual({}, csv)
        contains_gcdjson, csv = get_csv_from_sample(samples.last().data)
        self.assertTrue(contains_gcdjson)
        self.assertTrue(isinstance(csv, OrderedDict))
        csv = get_csv_from_samples(sub)
        self.assertLess(0, len(csv))
        self.assertIn('"gcdjson.', csv)
        self.assertEqual(4, csv.count('\r\n'))

    @skip('request to PANGAEA server')
    def test_create_pangaea_ticket(self):
        resource_credential = ResourceCredential()
        resource_credential.username = 'gfbio-broker'
        resource_credential.password = 'h_qB-RxCY)7y'
        resource_credential.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        resource_credential.save()

        site_config = SiteConfiguration.objects.get(pk=1)
        site_config.pangaea_server = resource_credential
        site_config.save()

        login_token = get_pangaea_login_token(resource_credential)
        response = create_pangaea_jira_ticket(login_token,
                                              site_configuration=site_config)

    @skip('request to PANGAEA server')
    def test_doi_parsing(self):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'h_qB-RxCY)7y'
        access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        access.save()
        login_token = get_pangaea_login_token(access)
        ticket_key = 'PDI-12428'
        url = '{0}{1}'.format(PANGAEA_ISSUE_BASE_URL, ticket_key)
        cookies = dict(PanLoginID=login_token)
        headers = {
            'Content-Type': 'application/json'
        }
        response = requests.get(
            url=url,
            headers=headers,
            cookies=cookies,
        )

    def test_filter_for_submission_additional_reference(self):
        s = Submission.objects.filter(status=Submission.OPEN).filter(
            additionalreference__type=AdditionalReference.PANGAEA_JIRA_TICKET)
        subs = Submission.objects.all()

        self.assertEqual(2, len(s))
        self.assertEqual(3, len(s[0].additionalreference_set.all()))
        self.assertEqual(2, len(s[0].additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET)))
        ref = s[0].additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET).first()
        self.assertEqual('PDI-0815', ref.reference_key)


class AdditionalReferenceTest(TestCase):
    fixtures = (
        'user', 'submission', 'resource_credential', 'additional_reference',
        'site_configuration', 'ticket_label',)

    def test_instance(self):
        reference = AdditionalReference(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            submission=Submission.objects.get(pk=1)
        )
        reference.save()
        self.assertFalse(reference.primary)
        self.assertTrue(isinstance(reference, AdditionalReference))

    def test_save_primary(self):
        sub = Submission.objects.get(pk=1)
        self.assertEqual(3, len(sub.additionalreference_set.all()))
        for ref in sub.additionalreference_set.all():
            if ref.pk == 1:
                self.assertTrue(ref.primary)
            else:
                self.assertFalse(ref.primary)

        pangeae_references = sub.additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET)
        self.assertEqual(2, len(pangeae_references))
        ref = pangeae_references.first()
        ref.primary = True
        ref.save()
        reference_changed = ref.reference_key

        pangeae_references = sub.additionalreference_set.filter(
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

        pangeae_references = sub.additionalreference_set.filter(
            type=AdditionalReference.PANGAEA_JIRA_TICKET)
        primary_references = pangeae_references.filter(primary=True)
        self.assertEqual(1, len(primary_references))
        self.assertEqual(reference_changed,
                         primary_references.first().reference_key)
        non_primary = pangeae_references.filter(primary=False)
        self.assertEqual(1, len(non_primary))
        self.assertNotEqual(reference_changed,
                            non_primary.first().reference_key)


def fake_trigger_submission_transfer(submission_id=None):
    return True


class TestAddSubmissionView(TestCase):
    fixtures = (
        'user', 'resource_credential', 'submission', 'site_configuration')

    new_data = {
        'requirements': {
            'title': '123456',
            'description': '123456',
            'study_type': 'Metagenomics',
            'samples': [
                {
                    'sample_alias': 'sample1',
                    'sample_title': 'stitle',
                    'taxon_id': 1234
                },
                {
                    'sample_alias': 'sample2',
                    'sample_title': 'stitleagain',
                    'taxon_id': 1234
                }
            ],
            "experiments": [
                {
                    'experiment_alias': 'experiment1',
                    'platform': 'AB 3730xL Genetic Analyzer',
                    'design': {
                        'sample_descriptor': 'sample2',
                        'design_description': '',
                        'library_descriptor': {
                            'library_strategy': 'AMPLICON',
                            'library_source': 'METAGENOMIC',
                            'library_selection': 'PCR',
                            'library_layout': {
                                'layout_type': 'paired',
                                'nominal_length': 450
                            }
                        }
                    }
                }
            ],
            'runs': [
                {
                    'experiment_ref': 'experiment1',
                    'data_block': {
                        'files': [
                            {
                                'filename': 'aFile',
                                'filetype': 'fastq',
                                'checksum_method': 'MD5',
                                'checksum': '12345'
                            }
                        ]
                    }
                }
            ]
        }
    }

    def _create_test_file(self, path):
        self._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'file': f,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionFileUpload.objects.all().delete()

    # TODO: modify to use new endpoints
    # --------------------------------------------------------------------------
    @skip('test against debug server, that needs to be up and running')
    def test_post_to_debug_server_full_submission(self):
        response = requests.post(
            url='http://127.0.0.1:8000/brokerage/submissions/full',
            data=json.dumps(FullWorkflowTest.content),
            headers={
                'Authorization': 'Token e4501de7f37d3044778f7939155f90cfb1625c6e',
                'Content-Type': 'application/json'}
        )

    @skip('test against GWDG')
    def test_post_to_gwdg_server(self):
        # let form validation fail
        # self.content['sample'] = 2
        # access existing submission
        # self.content['broker_submission_id'] = 'cdd73460-eec7-40a3-9a1f-f0a314f821f3'
        # change site_project_id
        # self.content['site_project_id'] = 'p8'

        response = requests.post(
            url='http://c103-170.cloud.gwdg.de/brokerage/submissions/full',
            data=json.dumps(FullWorkflowTest.content),
            headers={
                'Authorization': 'Token 95bf481b2262df60953c31604a585450445880af',
                'Content-Type': 'application/json'}
        )

    @skip('test against c103-171.cloud.gwdg.de (docker)')
    def test_post_to_gwdg_docker_server(self):
        response = requests.post(
            url='https://c103-171.cloud.gwdg.de/brokerage/submissions/full',
            data=json.dumps(FullWorkflowTest.content),
            headers={
                'Authorization': 'Token 8b63a9874f6188bf65987a56dd5b6ab5da7ec23a',
                'Content-Type': 'application/json'}
        )

    # @skip('test against services.gfbio.org (docker)')
    # def test_post_to_gwdg_docker_server_2(self):
    #     response = requests.post(
    #         url='https://https://services.gfbio.org/api/submissions/',
    #         data=json.dumps(FullWorkflowTest.content),
    #         headers={
    #             'Authorization': 'Token f411f893264e2fe3c153a8998fe2c9c75944cb89',
    #             'Content-Type': 'application/json'}
    #     )

    def _post_submission(self):
        VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'horst:password').decode('utf-8')}
        return VALID_USER, self.client.post('/api/submissions/',
                                            content_type='application/json',
                                            data=json.dumps({
                                                'target': 'ENA',
                                                'data': {
                                                    'requirements': {
                                                        'title': 'A Title',
                                                        'description': 'A Description'
                                                    }
                                                }
                                            }), **VALID_USER)

    def test_submissions_get_request(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_empty_min_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({}),
                                    **VALID_USER)
        self.assertEqual(400, response.status_code)

        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('target', keys)
        self.assertIn('data', keys)
        self.assertEqual(5, len(Submission.objects.all()))

    def test_invalid_min_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'data': {}
                                    }),
                                    **VALID_USER)
        self.assertEqual(400, response.status_code)
        keys = json.loads(response.content.decode('utf-8')).keys()
        self.assertIn('optional_validation', keys)
        self.assertIn('data', keys)
        self.assertEqual(5, len(Submission.objects.all()))

    def test_schema_error_min_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'data': {
                                            'requirements': {}
                                        }
                                    }),
                                    **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(400, response.status_code)
        self.assertIn('data', content.keys())
        self.assertListEqual(
            ["requirements : 'title' is a required property",
             "requirements : 'description' is a required property"],
            content['data'])
        self.assertEqual(5, len(Submission.objects.all()))

    def test_valid_min_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'data': {
                                            'requirements': {
                                                'title': 'A Title',
                                                'description': 'A Description'
                                            }
                                        }
                                    }),
                                    **VALID_USER)
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
            'target': 'ENA'}
        self.assertEqual(201, response.status_code)
        self.assertDictEqual(expected, content)
        self.assertEqual(6, len(Submission.objects.all()))

        submission = Submission.objects.last()
        self.assertEqual(UUID(content['broker_submission_id']),
                         submission.broker_submission_id)
        self.assertIsNone(submission.embargo)
        self.assertFalse(submission.release)
        self.assertEqual(0, len(submission.site_project_id))
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(0, len(submission.submitting_user))
        self.assertEqual(0, len(submission.submitting_user_common_information))
        self.assertEqual('ENA', submission.target)

        request_logs = RequestLog.objects.filter(type=RequestLog.INCOMING)
        self.assertEqual(1, len(request_logs))

    def test_valid_explicit_min_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic ' + base64.b64encode(b'horst:password').decode('utf-8')
        }

        # Alternative: use DRF APIClient for requests:
        # client = APIClient()
        # client.credentials(HTTP_AUTHORIZATION='Basic {}'.format(
        #     base64.b64encode(b'horst:password').decode("utf-8")))
        # response = client.post('/api/submissions/', data={
        #     'target': 'ENA',
        #     'release': False,
        #     'data': {
        #         'requirements': {
        #             'title': 'A Title',
        #             'description': 'A Description'
        #         }
        #     }
        # }, format='json')
        # print('RESP ', response.content)

        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'release': False,
                                        'data': {
                                            'requirements': {
                                                'title': 'A Title',
                                                'description': 'A Description'
                                            }
                                        }
                                    }),
                                    **VALID_USER
                                    )
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
        self.assertEqual(6, len(Submission.objects.all()))
        submission = Submission.objects.last()
        self.assertEqual(UUID(expected['broker_submission_id']),
                         submission.broker_submission_id)

    def test_min_post_without_target(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'release': False,
                                        'target': 'nonsense',
                                        'data': {
                                            'requirements': {
                                                'title': 'A Title',
                                                'description': 'A Description'
                                            }
                                        }
                                    }),
                                    **VALID_USER)
        self.assertEqual(400, response.status_code)
        self.assertIn(b'target', response.content)
        self.assertEqual(5, len(Submission.objects.all()))

    def test_empty_max_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'release': True,
                                        'data': {
                                            'requirements': {
                                                'title': 'A Title',
                                                'description': 'A Description'
                                            }
                                        }
                                    }),
                                    **VALID_USER)
        self.assertEqual(400, response.status_code)
        self.assertNotIn(b'study_alias', response.content)
        self.assertIn(b'study_type', response.content)
        self.assertIn(b'samples', response.content)
        self.assertIn(b'experiments', response.content)
        self.assertEqual(5, len(Submission.objects.all()))

    # FIXME: in unit tests: "id": "file:///opt/project/staticfiles/schemas/minimal_requirements.json",
    # FIXME: when running docker-compose with dev.yml
    # FIXME: id to /app/staticfiles/schemas/ena_requirements.json
    # FIXME: since id determins root for looking up included files
    def test_valid_max_post(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'release': True,
                                        'data': self.new_data
                                    }),
                                    **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        expected = {
            'broker_submission_id': '721117ae-cb8d-468b-bec9-aa92aff834d5',
            'data': {
                'requirements': {
                    'description': '123456',
                    'experiments': [
                        {'design': {'design_description': '',
                                    'library_descriptor': {
                                        'library_layout': {
                                            'layout_type': 'paired',
                                            'nominal_length': 450},
                                        'library_selection': 'PCR',
                                        'library_source': 'METAGENOMIC',
                                        'library_strategy': 'AMPLICON'},
                                    'sample_descriptor': 'sample2'},
                         'experiment_alias': 'experiment1',
                         'platform': 'AB 3730xL Genetic '
                                     'Analyzer',
                         'site_object_id': 'noob_13'}],
                    'runs': [{'data_block': {
                        'files': [{'checksum': '12345',
                                   'checksum_method': 'MD5',
                                   'filename': 'aFile',
                                   'filetype': 'fastq'}]},
                        'experiment_ref': 'experiment1',
                        'site_object_id': 'noob_14'}],
                    'samples': [{'sample_alias': 'sample1',
                                 'sample_title': 'stitle',
                                 'site_object_id': 'noob_11',
                                 'taxon_id': 1234},
                                {'sample_alias': 'sample2',
                                 'sample_title': 'stitleagain',
                                 'site_object_id': 'noob_12',
                                 'taxon_id': 1234}],
                    'site_object_id': 'noob_10',
                    'study_type': 'Metagenomics',
                    'title': '123456'}},
            'download_url': '',
            'embargo': None,
            'release': True,
            'site': 'horst',
            'site_project_id': '',
            'status': 'SUBMITTED',
            'submitting_user': '',
            'target': 'ENA'
        }
        self.assertEqual(201, response.status_code)
        expected['broker_submission_id'] = content['broker_submission_id']
        self.assertDictEqual(expected, content)
        self.assertEqual(6, len(Submission.objects.all()))
        submission = Submission.objects.last()

        self.assertEqual(UUID(expected['broker_submission_id']),
                         submission.broker_submission_id)
        self.assertEqual(Submission.SUBMITTED, content.get('status', 'NOPE'))

    def test_valid_max_post_with_data_url(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'release': True,
                                        'data': self.new_data
                                    }),
                                    **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(201, response.status_code)
        self.assertEqual(6, len(Submission.objects.all()))
        self.assertNotIn('download_url', content['data']['requirements'].keys())
        sub = Submission.objects.last()
        self.assertEqual('', sub.download_url)

        url = 'https://www.google.de'
        new_data_copy = copy.deepcopy(self.new_data)
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'release': False,
                                        'download_url': url,
                                        'data': new_data_copy
                                    }),
                                    **VALID_USER)
        self.assertEqual(201, response.status_code)
        self.assertEqual(7, len(Submission.objects.all()))
        sub = Submission.objects.last()
        self.assertEqual(url, sub.download_url)

        response = self.client.put(
            '/api/submissions/{0}/'.format(
                sub.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': new_data_copy,
                'download_url': '{0}/{1}'.format(url, 'download'),
            }), **VALID_USER)
        self.assertEqual(200, response.status_code)
        self.assertEqual(7, len(Submission.objects.all()))
        sub = Submission.objects.last()
        self.assertEqual('{0}/{1}'.format(url, 'download'), sub.download_url)

    def test_valid_max_post_with_invalid_min_data(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        self.assertEqual(5, len(Submission.objects.all()))
        data = copy.deepcopy(self.new_data)
        data['requirements'].pop('description')
        response = self.client.post('/api/submissions/',
                                    content_type='application/json',
                                    data=json.dumps({
                                        'target': 'ENA',
                                        'release': True,
                                        'data': data
                                    }),
                                    **VALID_USER
                                    )
        self.assertEqual(400, response.status_code)
        self.assertIn('description', response.content.decode('utf-8'))
        self.assertEqual(5, len(Submission.objects.all()))

    def test_get_submissions(self):
        VALID_USER, response = self._post_submission()
        response = self.client.get('/api/submissions/', **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertEqual(6, len(Submission.objects.all()))
        # two for this user (1 in fixture, 1 by post above)
        self.assertEqual(3, len(content))

    def test_get_submissions_for_user(self):
        USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'horst:password').decode('utf-8')}
        ADMIN = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'noob:password').decode('utf-8')}

        all_subs = Submission.objects.all()
        self.assertEqual(5, len(all_subs))

        response = self.client.get('/api/submissions/', **USER)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(2, len(content))

        # FIXME: unicode issues with test client
        # response = self.client.get('/api/submissions/', **ADMIN)
        # content = json.loads(response.content)
        # self.assertEqual(2, len(content))

    def test_get_submission(self):
        VALID_USER, response = self._post_submission()
        submission = Submission.objects.last()
        response = self.client.get(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            **VALID_USER
        )
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertEqual('horst', content['site'])

    def test_no_submission_for_id(self):
        VALID_USER, response = self._post_submission()
        response = self.client.get(
            '/api/submissions/{0}/'.format(
                uuid4()),
            **VALID_USER
        )
        self.assertEqual(404, response.status_code)

    def test_put_submission(self):
        VALID_USER, response = self._post_submission()
        self.assertEqual(6, len(Submission.objects.all()))
        submission = Submission.objects.last()
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}
                }
            }), **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual(200, response.status_code)
        self.assertTrue(isinstance(content, dict))
        self.assertIn('0815', content['data']['requirements']['title'])
        self.assertEqual(6, len(Submission.objects.all()))

    def test_putpost_submission(self):
        VALID_USER, response = self._post_submission()
        self.assertEqual(6, len(Submission.objects.all()))
        submission = Submission.objects.last()
        response = self.client.post(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}
                }
            }), **VALID_USER)
        self.assertEqual(405, response.status_code)
        self.assertEqual('{"detail":"Method \\"POST\\" not allowed."}',
                         response.content.decode('utf-8'))

    def test_put_submission_min_validation(self):
        VALID_USER, response = self._post_submission()
        submission = Submission.objects.last()
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}
                }
            }), **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        submission = Submission.objects.last()
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(200, response.status_code)
        self.assertIn('optional_validation', content['data'].keys())
        self.assertIn('optional_validation', submission.data)

        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                    }
                }
            }), **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN, submission.status)
        self.assertEqual(400, response.status_code)
        self.assertIn('optional_validation', content.keys())

    def test_put_submission_valid_max_validation(self):
        VALID_USER, response = self._post_submission()
        submission = Submission.objects.last()
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': self.new_data
            }), **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        submission = Submission.objects.last()
        self.assertEqual(200, response.status_code)
        self.assertFalse('optional_validation' in content['data'].keys())
        self.assertFalse('optional_validation' in submission.data)

        submission = Submission.objects.last()
        self.assertEqual(Submission.SUBMITTED,
                         content.get('status', 'NOPE'))
        self.assertEqual(Submission.SUBMITTED, submission.status)

    def test_put_submission_invalid_max_validation(self):
        VALID_USER, response = self._post_submission()
        submission = Submission.objects.last()
        data = copy.deepcopy(self.new_data)
        data['requirements'].pop('samples')
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': data
            }), **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))

        self.assertEqual(400, response.status_code)
        self.assertIn("'samples' is a required property",
                      response.content.decode('utf-8'))
        self.assertFalse(
            'optional_validation' in response.content.decode('utf-8'))

        submission = Submission.objects.last()
        self.assertEqual(Submission.OPEN, submission.status)

    def test_put_submission_max_validation_without_release(self):
        VALID_USER, response = self._post_submission()
        submission = Submission.objects.last()
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': self.new_data
            }), **VALID_USER)
        content = json.loads(response.content.decode('utf-8'))
        submission = Submission.objects.last()
        self.assertEqual(200, response.status_code)
        self.assertFalse('optional_validation' in content['data'].keys())
        self.assertFalse('optional_validation' in submission.data)
        submission = Submission.objects.first()
        self.assertEqual(Submission.OPEN,
                         content.get('status', 'NOPE'))
        self.assertEqual(Submission.OPEN, submission.status)

    def test_put_on_submitted_submission(self):
        VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'horst:password').decode('utf-8')}
        submission = Submission.objects.get(
            broker_submission_id=UUID('e931072e-61c2-42e4-923a-39b6ab255a9f'))
        self.assertEqual(Submission.SUBMITTED, submission.status)
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': self.new_data
            }), **VALID_USER)
        self.assertTrue(400, response.status_code)
        content = response.content.decode('utf-8')
        self.assertIn('"status":"SUBMITTED"', content)
        self.assertIn(
            '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
            content)
        self.assertIn('"error":"no modifications allowed with current status"',
                      content)

    def test_put_on_cancelled_submission(self):
        VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'horst:password').decode('utf-8')}
        submission = Submission.objects.get(
            broker_submission_id=UUID('e931072e-61c2-42e4-923a-39b6ab255a9f'))
        submission.status = Submission.CANCELLED
        submission.save()
        self.assertEqual(Submission.CANCELLED, submission.status)
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': self.new_data
            }), **VALID_USER)
        self.assertTrue(400, response.status_code)
        content = response.content.decode('utf-8')
        self.assertIn('"status":"CANCELLED"', content)
        self.assertIn(
            '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
            content)
        self.assertIn('"error":"no modifications allowed with current status"',
                      content)

    def test_put_on_error_submission(self):
        VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'horst:password').decode('utf-8')}
        submission = Submission.objects.get(
            broker_submission_id=UUID('e931072e-61c2-42e4-923a-39b6ab255a9f'))
        submission.status = Submission.ERROR
        submission.save()
        self.assertEqual(Submission.ERROR, submission.status)
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': self.new_data
            }), **VALID_USER)
        self.assertTrue(400, response.status_code)
        content = response.content.decode('utf-8')
        self.assertIn('"status":"ERROR"', content)
        self.assertIn(
            '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
            content)
        self.assertIn('"error":"no modifications allowed with current status"',
                      content)

    def test_put_on_closed_submission(self):
        VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.b64encode(
            b'horst:password').decode('utf-8')}
        submission = Submission.objects.get(
            broker_submission_id=UUID('e931072e-61c2-42e4-923a-39b6ab255a9f'))
        submission.status = Submission.CLOSED
        submission.save()
        self.assertEqual(Submission.CLOSED, submission.status)
        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': self.new_data
            }), **VALID_USER)
        self.assertTrue(400, response.status_code)
        content = response.content.decode('utf-8')
        self.assertIn('"status":"CLOSED"', content)
        self.assertIn('"error":"no modifications allowed with current status"',
                      content)
        self.assertIn(
            '"broker_submission_id":"e931072e-61c2-42e4-923a-39b6ab255a9f"',
            content)

    def test_post_on_submission_detail_view(self):
        VALID_USER, response = self._post_submission()
        submission = Submission.objects.first()
        response = self.client.post(
            '/api/submissions/{}/'.format(submission.pk),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}
                }
            }), **VALID_USER)
        self.assertEqual(405, response.status_code)

    def test_delete_submission(self):
        VALID_USER, response = self._post_submission()
        self.assertEqual(6, len(Submission.objects.all()))

        submission = Submission.objects.last()
        response = self.client.delete(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            **VALID_USER
        )

        self.assertEqual(204, response.status_code)
        self.assertEqual(6, len(Submission.objects.all()))
        sub = Submission.objects.last()
        self.assertEqual(Submission.CANCELLED, sub.status)
        submission = Submission.objects.last()
        self.assertEqual(Submission.CANCELLED, submission.status)

    def test_patch_submission(self):
        VALID_USER, response = self._post_submission()
        response = self.client.patch('/api/submissions/1/',
                                     content_type='application/json',
                                     data=json.dumps({
                                         'target': 'ENA_PANGAEA'
                                     }), **VALID_USER)
        self.assertEqual(405, response.status_code)

    def test_no_credentials(self):
        response = self.client.post('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_get_no_credentials(self):
        response = self.client.get('/api/submissions/')
        self.assertEqual(401, response.status_code)

    def test_get_submission_no_credentials(self):
        response = self.client.get('/api/submissions/{0}/'.format(uuid4()))
        self.assertEqual(401, response.status_code)

    def test_get_with_credentials(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        response = self.client.get('/api/submissions/', **VALID_USER)
        self.assertEqual(200, response.status_code)

    def test_invalid_basic_auth(self):
        INVALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:WRONG').decode('utf-8')
        }
        response = self.client.post('/api/submissions/',
                                    {"some": "data"},
                                    **INVALID_USER)
        self.assertEqual(401, response.status_code)

    def test_detail_invalid_basic_auth(self):
        INVALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:WRONG').decode('utf-8')
        }
        response = self.client.get('/api/submissions/{0}/'.format(uuid4()),
                                   **INVALID_USER)
        self.assertEqual(401, response.status_code)

    def test_valid_basic_auth(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        response = self.client.post('/api/submissions/',
                                    {"some": "data"},
                                    **VALID_USER)
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_super_user(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'noob:password').decode('utf-8')
        }
        response = self.client.post('/api/submissions/', **VALID_USER)

        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_staff_user(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'test_checker:password').decode(
                    'utf-8')
        }
        response = self.client.post('/api/submissions/', **VALID_USER)
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_active_user(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        response = self.client.post('/api/submissions/', **VALID_USER)
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)

    def test_inactive_user(self):
        INVALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'sonOfNoob:password').decode(
                    'utf-8')
        }
        response = self.client.post('/api/submissions/',
                                    **INVALID_USER)
        self.assertEqual(401, response.status_code)

    def test_active_user_without_permissions(self):
        INVALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'nobody:password').decode(
                    'utf-8')
        }
        response = self.client.post('/api/submissions/',
                                    **INVALID_USER)
        self.assertEqual(403, response.status_code)

    def test_invalid_token_authentication(self):
        INVALID_USER = {
            'HTTP_AUTHORIZATION':
                'Token %s' % 'afafff4f3f3f77faff2f71f'
        }
        response = self.client.post('/api/submissions/',
                                    {"some": "data"},
                                    **INVALID_USER)
        self.assertEqual(401, response.status_code)

    def test_valid_token_authentication(self):
        token = Token.objects.create(user=User.objects.get(username='horst'))
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Token %s' % token.key
        }
        response = self.client.post('/api/submissions/',
                                    {
                                        'site_project_id': 'p1',
                                        'submitting_user': 'johnDoe',
                                        'site_object_id': 'o1',
                                        'study': '{}'
                                    },
                                    **VALID_USER)
        self.assertNotEqual(401, response.status_code)
        self.assertEqual(400, response.status_code)


class TestInitialChainTasks(TestCase):
    fixtures = (
        'user', 'resource_credential', 'site_configuration', 'submission')

    def _post_submission_data(self):
        VALID_USER = {'HTTP_AUTHORIZATION': 'Basic %s' % base64.encodebytes(
            b'horst:password')}
        return VALID_USER, self.client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }), **VALID_USER)

    @staticmethod
    def fake_user_email_task(submission_id=None):
        # self.email_called = True
        return True

    @staticmethod
    def fake_create_ticket_task(prev_task_result=None, submission_id=None,
                                summary=None,
                                description=None):
        return True

        # @staticmethod
        # def fake_check_on_hold():
        #     return True

        # @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
        # def test_gfbio_get_user_by_id(self, mock_requests):
        #     mock_requests.post.return_value.status_code = 200
        #     mock_requests.post.return_value.ok = True
        #     response_data = {"firstname": "Marc", "middlename": "",
        #                      "emailaddress": "maweber@mpi-bremen.de",
        #                      "fullname": "Marc Weber",
        #                      "screenname": "maweber", "userid": 16250,
        #                      "lastname": "Weber"}
        #     mock_requests.post.return_value.content = json.dumps(response_data)

    @responses.activate
    def test_min_post_initial_chain(self):
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        sc = SiteConfiguration.objects.get(pk=1)
        responses.add(responses.POST,
                      '{0}{1}'.format(sc.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={"firstname": "Marc", "middlename": "",
                            "emailaddress": "maweber@mpi-bremen.de",
                            "fullname": "Marc Weber",
                            "screenname": "maweber", "userid": 16250,
                            "lastname": "Weber"},
                      status=200)
        min_response = self.client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'data': {
                    'requirements': {
                        'title': 'A Title',
                        'description': 'A Description'
                    }
                }
            }),
            **VALID_USER)
        self.assertEqual(201, min_response.status_code)

    @responses.activate
    def test_max_post_with_release_initial_chain(self):
        sc = SiteConfiguration.objects.get(pk=1)
        responses.add(responses.POST,
                      '{0}{1}'.format(sc.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={"firstname": "Marc", "middlename": "",
                            "emailaddress": "maweber@mpi-bremen.de",
                            "fullname": "Marc Weber",
                            "screenname": "maweber", "userid": 16250,
                            "lastname": "Weber"},
                      status=200)
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        max_response = self.client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': True,
                'data': TestAddSubmissionView.new_data
            }),
            **VALID_USER)
        self.assertEqual(201, max_response.status_code)

    @responses.activate
    def test_max_post_without_release_initial_chain(self):
        sc = SiteConfiguration.objects.get(pk=1)
        responses.add(responses.POST,
                      '{0}{1}'.format(sc.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={"firstname": "Marc", "middlename": "",
                            "emailaddress": "maweber@mpi-bremen.de",
                            "fullname": "Marc Weber",
                            "screenname": "maweber", "userid": 16250,
                            "lastname": "Weber"},
                      status=200)
        VALID_USER = {
            'HTTP_AUTHORIZATION':
                'Basic %s' % base64.b64encode(b'horst:password').decode('utf-8')
        }
        max_response = self.client.post(
            '/api/submissions/',
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': TestAddSubmissionView.new_data
            }),
            **VALID_USER)
        self.assertEqual(201, max_response.status_code)

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_put_initial_chain_no_release(self, mock_requests):
        VALID_USER, response = self._post_submission_data()
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        response_data = {"firstname": "Marc", "middlename": "",
                         "emailaddress": "maweber@mpi-bremen.de",
                         "fullname": "Marc Weber",
                         "screenname": "maweber", "userid": 16250,
                         "lastname": "Weber"}
        mock_requests.post.return_value.content = json.dumps(response_data)

        submission = Submission.objects.last()

        response = self.client.put(
            '/api/submissions/{0}/'.format(
                submission.broker_submission_id),
            content_type='application/json',
            data=json.dumps({
                'target': 'ENA',
                'release': False,
                'data': {
                    'requirements': {
                        'title': 'A Title 0815',
                        'description': 'A Description 2'}
                }
            }), **VALID_USER)


class TestServiceMethods(TestCase):
    fixtures = ('user', 'submission', 'resource_credential',
                'site_configuration', 'broker_object')

    def test_assemble_research_object_json(self):
        submission = FullWorkflowTest._prepare()
        prepared_json, broker_object_pks = gfbio_assemble_research_object_id_json(
            submission.brokerobject_set)
        self.assertTrue(isinstance(prepared_json, str))
        self.assertTrue(isinstance(broker_object_pks, list))
        json_result = json.loads(prepared_json)
        self.assertTrue(isinstance(json_result[0]['extendeddata'], str))

    def test_gfbio_assign_research_object_ids(self):
        submission = FullWorkflowTest._prepare()
        response = requests.models.Response()

        # 200 [{"brokerobjectid":129,"researchobjectversion":1,"researchobjectid":803},{"brokerobjectid":133,"researchobjectversion":1,"researchobjectid":804}]
        response.status_code = 200
        response._content = '[{"brokerobjectid":13,"researchobjectversion":1,' \
                            '"researchobjectid":803},{"brokerobjectid":14,' \
                            '"researchobjectversion":1,"researchobjectid":804},' \
                            '{"brokerobjectid":15,"researchobjectversion":1,' \
                            '"researchobjectid":805},{"brokerobjectid":16,' \
                            '"researchobjectversion":1,"researchobjectid":806},' \
                            '{"brokerobjectid":17,"researchobjectversion":1,"researchobjectid":807}, ' \
                            '{"brokerobjectid":18,"researchobjectversion":1,"researchobjectid":808}]'

        with patch('requests.post', return_value=response) as r:
            res = gfbio_site_object_ids_service(submission,
                                                SiteConfiguration.objects.get(
                                                    pk=1))
            self.assertEqual(200, response.status_code)

    # TODO/FIXME: do a request to server to get repsonse, then use it to mock for testing
    # @skip('request to WP1 server')
    # def test_create_research_object_ids(self):
    #     submission_data = SubmissionData.objects.all().last()
    #     response = gfbio_create_research_object_ids(submission_data)
    #     self.assertEqual(200, response.status_code)
    #     self.assertTrue(isinstance(json.loads(response.content), list))

    @skip('request to WP1 server')
    def test_create_single_research_object(self):
        sub = Submission.objects.get(pk=1)
        study = sub.brokerobject_set.filter(type='study').first()
        # FIXME: hardcoded values
        # name = study_alias aus study.data
        data = [{
            'name': 'study_katy_hoffmann_2016',
            'label': 'study_katy_hoffmann_2016',
            'description': 'Response of Arctic benthic bacterial deep-sea '
                           'communities to different detritus composition',
            'extendeddata': json.dumps({
                'study_type': 'Metagenomics',
                'center_name': 'MPI-BREM',
                'study_abstract': 'In a multidisciplinary ex situ experiment, benthic bacterial deep-sea communities from 2,500 m water depth at the Long-Term Ecological Research Observatory HAUSGARTEN (stationPS93/050-5 and 6), were retrieved using a TV-guided multiple corer. Surface sediments (0 - 2 cm) of 16 cores were mixed with sterile filtered deep-sea water to a final sediment dilution of 3.5 fold. The slurries were split and supplemented with five different types of habitat-related detritus: chitin, as the most abundant biopolymer in the oceans, and four different naturally occurring Arctic algae species, i.e. Thalassiosira weissflogii, Emiliania huxleyi, Bacillaria sp. and Melosira arctica. Incubations were performed in five replicates, at in situ temperature and at atmospheric pressure, as well as at in situ pressure of 250 atm. At the start of the incubation and after 23 days, changes in key community functions, i.e. extracellular enzymatic activity, oxygen respiration and secondary production of biomass (bacterial cell numbers and biomass), were assessed along with changes in the bacterial community composition based on 16S rRNA gene and 16S rRNA Illumina sequencing. In summary, differences in community structure and in the uptake and remineralization of carbon in the different treatments suggest an effect of organic matter quality on bacterial diversity as well as on carbon turnover at the seafloor. The work is part of the ERC Advanced Investigator Grant ABYSS (no. 294757) to Antje Boetius.',
                'study_title': 'Response of Arctic benthic bacterial deep-sea communities to different detritus composition',
                'study_alias': 'study_katy_hoffmann_2016'
            }),
            'researchobjecttype': 'study',
            'brokerobjectid': '25',
            'userid': 70001,
        }]

    @skip('get request to wp1 pub2 servers, readonly')
    def test_gfbio_get_user_by_id_utils(self):
        req_logs = RequestLog.objects.all()
        site_config = SiteConfiguration.objects.get(pk=1)
        pub2 = ResourceCredential()
        pub2.title = 'test-pub2'
        pub2.url = 'https://gfbio-pub2.inf-bb.uni-jena.de'
        pub2.authentication_string = '-'
        pub2.username = 'broker.agent@gfbio.org'
        pub2.password = 'AgentPhase2'
        pub2.comment = 'comment'
        pub2.save()
        site_config.gfbio_server = pub2
        site_config.save()
        response = gfbio_get_user_by_id(user_id='70001',
                                        site_configuration=site_config)
        req_logs = RequestLog.objects.all()

    @skip('get request to wp1 servers, readonly')
    def test_get_user_by_id_ws(self):
        # url =  url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/' \
        #       'GFBioProject-portlet.researchobject/create-research-object/' \
        #       'request-json/{}'.format(json.dumps(test_data))
        data = {
            'userid': 16250
        }
        #                                       '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'
        url = 'https://gfbio-pub2.inf-bb.uni-jena.de/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/'
        # response = requests.post(
        #     url=url,
        #     headers={'Accept': 'application/json'},
        #     auth=('broker.agent@gfbio.org', 'AgentPhase2'),
        #     data=data
        # )
        # 200
        # {"exception": "java.lang.RuntimeException",
        #  "message": "No JSON web service action associated with path /userextension/get-user-by-id and method POST for //GFBioProject-portlet"}

        url += 'request-json/{0}'.format(json.dumps(data))
        response = requests.get(
            url=url,
            headers={'Accept': 'application/json'},
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
        )

        content_dict = json.loads(response.content)
        # 'userid': 16250
        # 200
        # {"firstname": "Marc", "middlename": "",
        #  "^": "maweber@mpi-bremen.de", "fullname": "Marc Weber",
        #  "screenname": "maweber", "userid": 16250, "lastname": "Weber"}

        # 'userid': 16926
        # 200
        # {"ERROR": {"cause": null,
        # "localizedMessage": "No User exists with the primary key 16926",
        # "message": "No User exists with the primary key 16926",
        # "ourStackTrace": [{
        #                       "className": "com.liferay.portal.service.persistence.UserPersistenceImpl",
        #                       "fileName": "UserPersistenceImpl.java",
        #                       "lineNumber": 7199, ... COMPLETE STACKTRACE ...

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_gfbio_get_user_by_id(self, mock_requests):
        mock_requests.get.return_value.status_code = 200
        mock_requests.get.return_value.ok = True
        response_data = {"firstname": "Marc", "middlename": "",
                         "emailaddress": "maweber@mpi-bremen.de",
                         "fullname": "Marc Weber",
                         "screenname": "maweber", "userid": 16250,
                         "lastname": "Weber"}
        mock_requests.get.return_value.content = json.dumps(response_data)
        conf = SiteConfiguration.objects.create(
            title='Title',
            site=User.objects.get(pk=1),
            ena_server=ResourceCredential.objects.get(pk=1),
            pangaea_server=ResourceCredential.objects.get(pk=2),
            gfbio_server=ResourceCredential.objects.get(pk=1),
            helpdesk_server=ResourceCredential.objects.get(pk=2),
            comment='Comment'
        )
        submission = Submission.objects.first()
        response = gfbio_get_user_by_id(16250, conf, submission=submission)
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertDictEqual(response_data, content)

        response = gfbio_get_user_by_id('16250', conf, submission=submission)
        self.assertEqual(200, response.status_code)
        content = json.loads(response.content)
        self.assertDictEqual(response_data, content)

    @skip('request to WP1 server')
    def test_simple_request_to_wp1Ws(self):
        # old style: no brokerobjecids
        test_data = [
            {
                "name": "PID-TEST2",
                "label": "PID-TEST-LABEL2",
                "extendeddata": "{'metadata':'all_information_2'}",
                "researchobjecttype": "sample",
            },
            {
                "name": "PID-TEST3",
                "label": "PID-TEST-LABEL3",
                "extendeddata": "{'metadata':'all_information_3'}",
                "researchobjecttype": "experiment",
            }
        ]
        url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/' \
              'GFBioProject-portlet.researchobject/create-research-object/' \
              'request-json/{}'.format(json.dumps(test_data))

        response = requests.get(
            url=url,
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
            headers={
                'Accept': 'application/json'
            }
        )

        # 200 [{"researchobjectversion":1,"researchobjectid":801},{"researchobjectversion":1,"researchobjectid":802}]

        # ----------------------------------------------------------------------
        # new style: with brokerobjecids
        test_data = [
            {
                "name": "PID-TEST2",
                "label": "PID-TEST-LABEL2",
                "extendeddata": "{'metadata':'all_information_2'}",
                "researchobjecttype": "sample",
                "brokerobjectid": 129
            },
            {
                "name": "PID-TEST3",
                "label": "PID-TEST-LABEL3",
                "extendeddata": "{'metadata':'all_information_3'}",
                "researchobjecttype": "experiment",
                "brokerobjectid": 133
            }
        ]
        url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/' \
              'GFBioProject-portlet.researchobject/create-research-object/' \
              'request-json/{}'.format(json.dumps(test_data))

        response = requests.post(
            url=url,
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
            headers={
                'Accept': 'application/json'
            }
        )

        # 200 [{"brokerobjectid":129,"researchobjectversion":1,"researchobjectid":803},{"brokerobjectid":133,"researchobjectversion":1,"researchobjectid":804}]

    @skip('comparing output')
    def test_dummy_id_view(self):
        response = self.client.post('/brokerage/id/dummy/', {})
        response = self.client.get('/brokerage/id/dummy/')


@skip('completly skip this unil real use-case is defined')
class TestGFBioSubmissionRegistryAccess(TestCase):
    @skip('request to WP1 server')
    def test_portal_create_submission_registry_ws(self):
        # marcel: http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/GFBioProject-portlet.submission/create-submision".concat("/request-json/").concat(requestArray.toString())
        data = json.dumps([
            {
                "userid": 15926,
                "researchobjectid": 401,
                "researchobjectversion": 1,
                "archive": "PANGAEA",
                "brokersubmissionid": "E7DAA13C-1AA7-40E7-AFCA-D0986F0AAC97"
            }
        ]).replace('\\"', '\'')

        url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/' \
              'api/jsonws/GFBioProject-portlet.submission/create-submision/' \
              'request-json/{}'.format(data)

        headers = {
            'Accept': 'application/json'
        }
        response = requests.post(
            url=url,
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
            headers=headers,
            # data=data
        )

    @skip('request to WP1 server')
    def test_portal_get_submission_registry_entries_via_bsi(self):
        data = json.dumps(
            {
                "brokersubmissionid": "E7DAA13C-1AA7-40E7-AFCA-D0986F0AAC97"
            }
        ).replace('\\"', '\'')

        url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/' \
              'GFBioProject-portlet.submission/get-submisions-by-broker-' \
              'submission-id/request-json/{}'.format(data)

        headers = {
            'Accept': 'application/json'
        }
        response = requests.post(
            url=url,
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
            headers=headers,
            # data=data
        )
        content = json.loads(response.content)
        #     status:  200
        # [{u'archive': u'PANGAEA                                                                    ',
        #   u'archivepid': u'testPID1',
        #   u'archivepidtype': 1268,
        #   u'brokersubmissionid': u'E7DAA13C-1AA7-40E7-AFCA-D0986F0AAC97                                       ',
        #   u'ispublic': False,
        #   u'lastchanged': u'2016-03-01 11:02:43.572',
        #   u'publicafter': u'2016-08-16 00:00:00.0',
        #   u'researchobjectid': 301,
        #   u'researchobjectversion': 1,
        #   u'status': u'sent',
        #   u'userid': 15926}, (...) ]

    @skip('request to WP1 server')
    def test_portal_get_submission_registry_entries_via_roid(self):
        data = json.dumps(
            {
                'researchobjectid': 401
            }
        ).replace('\\"', '\'')

        url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/' \
              'GFBioProject-portlet.submission/get-submisions-by-research-object-id/' \
              'request-json/{}'.format(data)

        headers = {
            'Accept': 'application/json'
        }
        response = requests.post(
            url=url,
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
            headers=headers,
            # data=data
        )
        content = json.loads(response.content)
        # status:  200
        # [{u'archive': u'PANGAEA                                                                    ',
        #   u'archivepid': u'',
        #   u'archivepidtype': 1268,
        #   u'brokersubmissionid': u'E7DAA13C-1AA7-40E7-AFCA-D0986F0AAC97                                       ',
        #   u'ispublic': False,
        #   u'lastchanged': u'2016-03-07 15:35:46.225',
        #   u'publicafter': u'',

        # TODO: this will be Brokerobject site_object_id
        #   u'researchobjectid': 401,
        #   u'researchobjectversion': 1,
        #   u'status': u'sent',

        # TODO: this will be Submission submitting user
        #   u'userid': 15926}]

    @skip('request to WP1 server')
    def test_portal_update_submission_registry_update(self):
        data = json.dumps([
            {
                'researchobjectid': 401,
                'brokersubmissionid': 'E7DAA13C-1AA7-40E7-AFCA-D0986F0AAC97',
                'archive': 'PANGAEA',
                'archivepid': 'ACC4711',
                'userid': 15926
            }
        ])

        data2 = json.dumps([
            {
                "researchobjectid": 401,
                "brokersubmissionid": "E7DAA13C-1AA7-40E7-AFCA-D0986F0AAC97",
                "archive": "PANGAEA",
                "archivepid": "ACC4711",
                "userid": 15926
            }
        ])

        url = 'http://gfbio-pub2.inf-bb.uni-jena.de:8080/api/jsonws/' \
              'GFBioProject-portlet.submission/update-submision/request-json/{}'.format(
            data)

        headers = {
            'Accept': 'application/json'
        }
        response = requests.post(
            url=url,
            auth=('broker.agent@gfbio.org', 'AgentPhase2'),
            headers=headers,
        )
        content = json.loads(response.content)

        # status:  200
        # [{u'archive': u'PANGAEA',
        #   u'researchobjectid': 401,
        #   u'researchobjectversion': 1}]
        #


class TestGFBioJira(TestCase):
    base_url = 'http://helpdesk.gfbio.org'
    api_sub_url = '/rest/api/2/issue'

    # TODO: get credential dynamically e.g. env or elsewhere
    @skip('Test against helpdesk server')
    def test_create_request(self):
        url = 'http://helpdesk.gfbio.org/rest/api/2/issue/'
        response = requests.post(
            url=url,
            auth=('brokeragent', 'puN;7_k[-"_,ZiJi'),
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                'fields': {
                    'project': {
                        'key': 'SAND'
                    },
                    'summary': 'Testing REST API programmatic',
                    'description': 'Generating JIRA issues via django unit-test.',
                    'issuetype': {
                        'name': 'IT Help'
                    },
                    'reporter': {
                        'name': 'testuser1'
                    },
                    'customfield_10010': 'sand/data-submission'
                }
            })
        )

    @skip('Test against helpdesk server')
    def test_comment_existing_ticket(self):
        ticket_key = 'SAND-38'
        ticket_action = 'comment'
        url = '{0}{1}/{2}/{3}'.format(self.base_url, self.api_sub_url,
                                      ticket_key, ticket_action)
        response = requests.post(
            url=url,
            auth=('brokeragent', 'puN;7_k[-"_,ZiJi'),
            headers={
                'Content-Type': 'application/json'
            },
            data=json.dumps({
                'body': 'programmatic update of ticket {}'.format(ticket_key)
            })
        )
        # working (compate test above)! -> output:
        # response.status  201
        # content
        # {u'author': {u'active': True,
        #              u'avatarUrls': {u'16x16': u'http://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10122',
        #                              u'24x24': u'http://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10122',
        #                              u'32x32': u'http://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10122',
        #                              u'48x48': u'http://helpdesk.gfbio.org/secure/useravatar?avatarId=10122'},
        #              u'displayName': u'Broker Agent',
        #              u'emailAddress': u'brokeragent@gfbio.org',
        #              u'key': u'brokeragent@gfbio.org',
        #              u'name': u'brokeragent',
        #              u'self': u'http://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent',
        #              u'timeZone': u'Etc/UTC'},
        #  u'body': u'programmatic update of ticket SAND-38',
        #  u'created': u'2016-01-26T14:00:06.449+0000',
        #  u'id': u'10111',
        #  u'self': u'http://helpdesk.gfbio.org/rest/api/2/issue/10129/comment/10111',
        #  u'updateAuthor': {u'active': True,
        #                    u'avatarUrls': {u'16x16': u'http://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10122',
        #                                    u'24x24': u'http://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10122',
        #                                    u'32x32': u'http://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10122',
        #                                    u'48x48': u'http://helpdesk.gfbio.org/secure/useravatar?avatarId=10122'},
        #                    u'displayName': u'Broker Agent',
        #                    u'emailAddress': u'brokeragent@gfbio.org',
        #                    u'key': u'brokeragent@gfbio.org',
        #                    u'name': u'brokeragent',
        #                    u'self': u'http://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent',
        #                    u'timeZone': u'Etc/UTC'},
        #  u'updated': u'2016-01-26T14:00:06.449+0000'}


class TestCeleryTasks(TestCase):
    # 'persistent_identifier',
    fixtures = ('user', 'submission', 'broker_object',
                'resource_credential', 'additional_reference',
                'site_configuration')

    # def test_close_submission_task(self):
    #     sub = FullWorkflowTest._prepare()
    #     self.assertEqual(Submission.OPEN, sub.status)
    #     with patch('config.celeryconfig.CELERY_ALWAYS_EAGER', True,
    #                create=True):
    #         result = close_submission_task.apply_async(
    #             kwargs={
    #                 'submission_id': sub.pk
    #             }
    #         )
    #         self.assertTrue(result.successful())
    #         sub = Submission.objects.get(pk=sub.pk)
    #         self.assertEqual(Submission.CLOSED, sub.status)

    def test_prepare_ena_submission_data_task(self):
        sub = FullWorkflowTest._prepare()
        atds = AuditableTextData.objects.all()
        self.assertEqual(0, len(atds))
        result = prepare_ena_submission_data_task.apply_async(
            kwargs={
                'submission_id': sub.pk
            }
        )
        ret_val = result.get()
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, dict))
        self.assertIn('SAMPLE', ret_val.keys())
        atds = AuditableTextData.objects.all()
        self.assertEqual(4, len(atds))

    @patch('gfbio_submissions.brokerage.utils.ena.requests')
    def test_transfer_to_ena_task_successful(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
        <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
                 success="true">
            <EXPERIMENT accession="ERX1228437" alias="4:f844738b-3304-4db7-858d-b7e47b293bb2"
                        status="PRIVATE"/>
            <RUN accession="ERR1149402" alias="5:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"/>
            <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                <EXT_ID accession="SAMEA3682542" type="biosample"/>
                <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
            </SAMPLE>
            <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                <EXT_ID accession="SAMEA3682543" type="biosample"/>
            </SAMPLE>
            <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
                   holdUntilDate="2016-03-05Z"/>
            <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
            <MESSAGES>
                <INFO>ADD action for the following XML: study.xml sample.xml
                    experiment.xml run.xml
                </INFO>
            </MESSAGES>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>HOLD</ACTIONS>
        </RECEIPT>""")

        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=sub.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=sub.pk
            )
        )()

        text_data = AuditableTextData.objects.filter(submission=sub)
        self.assertEqual(4, len(text_data))
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, tuple))

    @patch('gfbio_submissions.brokerage.utils.ena.requests')
    def test_transfer_to_ena_task_client_error(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        mock_requests.post.return_value.status_code = 400
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = \
            "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<?xml-stylesheet " \
            "type=\"text/xsl\" href=\"receipt.xsl\"?>\n<RECEIPT " \
            "receiptDate=\"2015-08-04T11:50:22.438+01:00\" " \
            "submissionFile=\"submission.xml\" success=\"false\"><STUDY " \
            "alias=\"a\" status=\"PUBLIC\"/><SUBMISSION alias=\"ADD_SUBMISSION_ALIAS\"" \
            "/><MESSAGES><ERROR>Please provide an abstract to describe your" \
            " study(null) in details</ERROR><INFO> VALIDATE action for the " \
            "following XML: study.xml sample.xml         </INFO></MESSAGES>" \
            "<ACTIONS>VALIDATE</ACTIONS><ACTIONS>VALIDATE</ACTIONS><ACTIONS>HOLD" \
            "</ACTIONS></RECEIPT>"
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=sub.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=sub.pk
            )
        )()
        ret_val = result.get()
        self.assertTrue(result.successful())
        ret_val = result.get()
        self.assertTrue(isinstance(ret_val, tuple))

    @patch('gfbio_submissions.brokerage.utils.ena.requests')
    def test_transfer_to_ena_task_server_error(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        mock_requests.post.return_value.status_code = 500
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = '{}'
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=sub.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=sub.pk
            )
        )()

        ret_val = result.get()
        self.assertFalse(result.successful())
        self.assertIsNone(ret_val)

    @patch('gfbio_submissions.brokerage.utils.ena.requests')
    def test_process_ena_response_task_successful(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?> <?xml-stylesheet type="text/xsl" href="receipt.xsl"?>
        <RECEIPT receiptDate="2015-12-01T11:54:55.723Z" submissionFile="submission.xml"
                 success="true">
                        status="PRIVATE"/>
            <RUN accession="ERR1149402" alias="5:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"/>
            <SAMPLE accession="ERS989691" alias="2:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                <EXT_ID accession="SAMEA3682542" type="biosample"/>
                <EXT_ID accession="SAMEA3682543-666" type="sample-this"/>
            </SAMPLE>
            <SAMPLE accession="ERS989692" alias="3:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE">
                <EXT_ID accession="SAMEA3682543" type="biosample"/>
            </SAMPLE>
            <STUDY accession="ERP013438" alias="1:f844738b-3304-4db7-858d-b7e47b293bb2" status="PRIVATE"
                   holdUntilDate="2016-03-05Z">
                <EXT_ID accession="PRJEB20411" type="Project"/>
            </STUDY>
            <SUBMISSION accession="ERA540869" alias="NGS_March_original2"/>
            <MESSAGES>
                <INFO>ADD action for the following XML: study.xml sample.xml
                    experiment.xml run.xml
                </INFO>
            </MESSAGES>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>ADD</ACTIONS>
            <ACTIONS>HOLD</ACTIONS>
        </RECEIPT>""")
        result = chain(
            prepare_ena_submission_data_task.s(
                submission_id=sub.pk
            ),
            transfer_data_to_ena_task.s(
                submission_id=sub.pk
            ),
            process_ena_response_task.s(
                submission_id=sub.pk
            )
        )()

        ret_val = result.get()
        self.assertTrue(result.successful())
        self.assertTrue(ret_val)

    def test_create_broker_objects_from_submission_data_task(self):
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(6, len(broker_objects))
        sub = Submission.objects.get(pk=1)
        sub.release = True
        sub.status = Submission.SUBMITTED
        sub.save()

        # without task to debug
        # BrokerObject.objects.add_submission_data(sub,
        #                                          submission_data)

        result = create_broker_objects_from_submission_data_task.apply_async(
            kwargs={
                'submission_id': 1
            },
        )
        self.assertTrue(result.successful())
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(11, len(broker_objects))

    def test_check_on_hold_status_task(self):
        result = check_on_hold_status_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(result.successful())

    # @patch('gfbio_submissions.brokerage.models.logger')
    # def test_log(self, mock_logger):
    #     submission = Submission.objects.all().first()
    #     submission.log()
    #     self.assertTrue(mock_logger.info.called)

    @patch('gfbio_submissions.brokerage.tasks.logger')
    def test_check_on_hold_proceed_without_email(self, mock_logger):
        sub = Submission.objects.get(pk=1)
        conf = SiteConfiguration.objects.get(site=sub.site)
        conf.release_submissions = True
        conf.save()
        result = check_on_hold_status_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(mock_logger.info.called)
        reports = TaskProgressReport.objects.all()
        task_names = [r.task_name for r in reports]
        self.assertTrue('tasks.check_on_hold_status_task' in task_names)

    # TODO: this one below
    # TODO: check all test, even if passing, for json exceptions that need repsonse mock

    @responses.activate
    def test_get_gfbio_user_email_task_success(self):
        sub = Submission.objects.get(pk=1)
        sub.submitting_user = '16250'
        sub.save()

        config = SiteConfiguration.objects.get(pk=1)
        config.use_gfbio_services = True
        config.gfbio_server.username = 'HORST'
        config.gfbio_server.password = 'PASS'
        config.gfbio_server.save()
        config.save()
        data = json.dumps({
            'userid': 16250
        })
        url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
            config.gfbio_server.url, data)
        responses.add(responses.GET,
                      'http://www.example1.com/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/%7B%22userid%22:%2016250%7D',
                      status=200,
                      headers={
                          'Accept': 'application/json'
                      },
                      json={"firstname": "Marc", "middlename": "",
                            "emailaddress": "maweber@mpi-bremen.de",
                            "fullname": "Marc Weber",
                            "screenname": "maweber", "userid": 16250,
                            "lastname": "Weber"})

        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': 'Marc', 'last_name': 'Weber',
                          'user_email': 'maweber@mpi-bremen.de',
                          'user_full_name': 'Marc Weber'}, result.get())

    @responses.activate
    def test_get_gfbio_user_email_task_no_gfbio_services(self):
        sub = Submission.objects.get(pk=1)
        sub.submitting_user = '16250'
        sub.save()
        config = SiteConfiguration.objects.get(pk=1)
        config.use_gfbio_services = False
        config.save()
        data = json.dumps({
            'userid': 16250
        })
        url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
            config.gfbio_server.url, data)
        responses.add(responses.GET, url, status=200,
                      json={})
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_get_gfbio_user_email_task_error_response(self, mock_requests):
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        response_data = '{"exception": "java.lang.RuntimeException", "message": ' \
                        '"No JSON web service action associated with path ' \
                        '/userextension/get-user-by-id and method POST for ' \
                        '//GFBioProject-portlet"}'
        mock_requests.post.return_value.content = json.dumps(response_data)
        sub = Submission.objects.get(pk=1)
        sub.submitting_user = '16250'
        sub.save()
        config = SiteConfiguration.objects.get(pk=1)
        config.use_gfbio_services = False
        config.save()
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_get_gfbio_user_email_task_corrupt_response(self, mock_requests):
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        response_data = 'xyz'
        mock_requests.post.return_value.content = json.dumps(response_data)
        sub = Submission.objects.get(pk=1)
        sub.submitting_user = '16250'
        sub.save()
        config = SiteConfiguration.objects.get(pk=1)
        config.use_gfbio_services = False
        config.save()
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_get_gfbio_user_email_task_400_response(self, mock_requests):
        mock_requests.post.return_value.status_code = 400
        mock_requests.post.return_value.ok = False
        response_data = ''
        mock_requests.post.return_value.content = json.dumps(response_data)
        sub = Submission.objects.get(pk=1)
        sub.submitting_user = '16250'
        sub.save()
        config = SiteConfiguration.objects.get(pk=1)
        config.use_gfbio_services = False
        config.save()
        result = get_gfbio_user_email_task.apply_async(
            kwargs={
                'submission_id': 1
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual({'first_name': '', 'last_name': '',
                          'user_email': 'kevin@horstmeier.de',
                          'user_full_name': ''}, result.get())

    @responses.activate
    def test_create_helpdesk_ticket_task_success(self):
        sc = SiteConfiguration.objects.get(pk=1)
        submission = Submission.objects.get(pk=1)

        responses.add(responses.POST,
                      '{0}{1}'.format(sc.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={"bla": "blubb"},
                      status=200)

        self.assertEqual(3, len(submission.additionalreference_set.all()))
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )

        self.assertTrue(result.successful())
        submission = Submission.objects.get(pk=1)
        self.assertEqual(4, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_create_helpdesk_ticket_task_unicode_text(self):
        sc = SiteConfiguration.objects.get(pk=1)
        submission = Submission.objects.get(pk=1)

        self.assertEqual(3, len(submission.additionalreference_set.all()))
        responses.add(responses.POST,
                      '{0}{1}'.format(sc.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={"bla": "blubb"},
                      status=200)
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )

        self.assertTrue(result.successful())
        submission = Submission.objects.get(pk=1)
        self.assertEqual(4, len(submission.additionalreference_set.all()))

    @responses.activate
    def test_comment_helpdesk_ticket_task_success(self):
        sc = SiteConfiguration.objects.get(pk=1)
        url = '{0}{1}/{2}/{3}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST,
                      url,
                      json={"bla": "blubb"},
                      status=200)
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        submission = Submission.objects.get(pk=1)
        result = comment_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'comment_body': 'test-comment'
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

    @responses.activate
    def test_comment_helpdesk_ticket_task(self):
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        sc = SiteConfiguration.objects.get(pk=1)
        url = '{0}{1}/{2}/{3}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST,
                      url,
                      json={"bla": "blubb"},
                      status=200)
        submission = Submission.objects.get(pk=1)
        result = comment_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'comment_body': 'test-comment'
            }
        )
        self.assertTrue(result.successful())

    @responses.activate
    def test_attach_to_helpdesk_ticket_task_no_primarydatafile(self):
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        sc = SiteConfiguration.objects.get(pk=1)
        url = '{0}{1}/{2}/{3}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST,
                      url,
                      json=[{
                          "self": "https://helpdesk.gfbio.org/rest/api/2/attachment/10814",
                          "id": "10814",
                          "filename": "test_primary_data_file_TE4k513",
                          "author": {
                              "self": "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent",
                              "name": "brokeragent",
                              "key": "brokeragent@gfbio.org",
                              "emailAddress": "brokeragent@gfbio.org",
                              "avatarUrls": {
                                  "48x48": "https://helpdesk.gfbio.org/secure/useravatar?avatarId=10349",
                                  "24x24": "https://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10349",
                                  "16x16": "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10349",
                                  "32x32": "https://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10349"},
                              "displayName": "Broker Agent", "active": True,
                              "timeZone": "Europe/Berlin"},
                          "created": "2017-06-19T09:23:43.000+0000", "size": 8,
                          "content": "https://helpdesk.gfbio.org/secure/attachment/10814/test_primary_data_file_TE4k513"}],
                      status=200)
        submission = Submission.objects.get(pk=1)
        result = attach_file_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertFalse(result.get())

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_attach_to_helpdesk_ticket_task_with_primarydatafile(self,
                                                                 mock_requests):
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"bla": "blubb"}'
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )

        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': submission.broker_submission_id})

        data = TestPrimaryDataFile._create_test_data(
            '/tmp/test_primary_data_file')
        token = Token.objects.create(user=submission.site)
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')
        mock_requests.post.return_value.content = '[{"self": "https://helpdesk.gfbio.org/rest/api/2/attachment/10814", "id": "10814", "filename": "test_primary_data_file_TE4k513", "author": { "self": "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent", "name": "brokeragent", "key": "brokeragent@gfbio.org", "emailAddress": "brokeragent@gfbio.org", "avatarUrls": { "48x48": "https://helpdesk.gfbio.org/secure/useravatar?avatarId=10349", "24x24": "https://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10349", "16x16": "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10349", "32x32": "https://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10349"}, "displayName": "Broker Agent", "active": true, "timeZone": "Europe/Berlin"}, "created": "2017-06-19T09:23:43.000+0000", "size": 8, "content": "https://helpdesk.gfbio.org/secure/attachment/10814/test_primary_data_file_TE4k513"}]'
        submission = Submission.objects.get(pk=1)
        result = attach_file_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(result.successful())
        self.assertTrue(result.get())

    @patch(
        'gfbio_submissions.brokerage.tasks.apply_timebased_task_retry_policy')
    def test_attach_primarydatafile_without_ticket(self, mock):
        submission = Submission.objects.get(pk=1)
        result = attach_file_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
            }
        )
        self.assertTrue(mock.called)

    @responses.activate
    def test_add_pangaealink_to_helpdesk_ticket_task_success(self):
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        sc = SiteConfiguration.objects.get(pk=1)
        url = '{0}{1}/{2}/{3}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url,
                      json={"bla": "blubb"},
                      status=200)
        submission = Submission.objects.get(pk=1)
        result = add_pangaealink_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertTrue(result.successful())

    @responses.activate
    def test_add_pangaealink_to_helpdesk_ticket_task_client_error(self):
        sc = SiteConfiguration.objects.get(pk=1)
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = '{0}{1}/{2}/{3}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'FAKE_KEY',
            HELPDESK_COMMENT_SUB_URL,
        )
        responses.add(responses.POST, url, status=400, json={"bla": "blubb"})
        result = add_pangaealink_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertTrue(result.successful())

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_add_pangaealink_to_helpdesk_ticket_task_server_error(self,
                                                                  mock_requests):
        submission = Submission.objects.get(pk=1)
        submission.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        mock_requests.post.return_value.status_code = 500
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = '{"bla": "blubb"}'
        submission = Submission.objects.get(pk=1)
        result = add_pangaealink_to_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertFalse(result.successful())

    @responses.activate
    def test_create_helpdesk_ticket_task_client_error(self):
        submission = Submission.objects.get(pk=1)
        sc = SiteConfiguration.objects.get(pk=1)
        url = '{0}{1}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL
        )
        responses.add(responses.POST,
                      url,
                      json={},
                      status=400)

        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertTrue(result.successful())

    @responses.activate
    def test_create_helpdesk_ticket_task_server_error(self):
        sc = SiteConfiguration.objects.get(pk=1)
        url = '{0}{1}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL
        )
        responses.add(responses.POST, url, status=500,
                      json={"bla": "blubb"})
        result = create_helpdesk_ticket_task.apply_async(
            kwargs={
                'submission_id': 1,
                'summary': 'Test',
                'description': 'Test'

            }
        )
        self.assertFalse(result.successful())

    # ---------------------- Pangaea tasks -------------------------------------

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_request_pangaea_login_token_task_success(self, mock_requests):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'h_qB-RxCY)7y'
        access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        access.save()

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = textwrap.dedent(
            """<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")
        result = request_pangaea_login_token_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual('f3d7aca208aaec8954d45bebc2f59ba1522264db',
                         result.get())

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('http://www.example2.com',
                         request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_request_pangaea_login_token_task_client_error(self, mock_requests):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'h_qB-RxCY)7y'
        access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        access.save()

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 400
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = request_pangaea_login_token_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertTrue(result.successful())
        self.assertEqual('', result.get())

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('http://www.example2.com',
                         request_logs.first().url)

    @responses.activate
    def test_request_pangaea_login_token_task_server_error(self):
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        sc = SiteConfiguration.objects.get(pk=1)
        responses.add(responses.POST, sc.pangaea_server.url, status=500,
                      body='')
        result = request_pangaea_login_token_task.apply_async(
            kwargs={
                'submission_id': 1,
            }
        )
        self.assertFalse(result.successful())

        request_logs = RequestLog.objects.all()
        # 3 logentries for 3 retries
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('http://www.example2.com',
                         request_logs.first().url)

    @responses.activate
    def test_create_pangaea_jira_ticket_task_success(self):
        submission = Submission.objects.get(pk=1)

        self.assertEqual(3, len(submission.additionalreference_set.all()))
        login_token = 'f3d7aca208aaec8954d45bebc2f59ba1522264db'

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        responses.add(responses.POST,
                      PANGAEA_ISSUE_BASE_URL,
                      json={"id": "31444", "key": "PDI-11735",
                            "self": "http://issues.pangaea.de/rest/api/2/issue/31444"},
                      status=201)
        result = create_pangaea_jira_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'login_token': login_token
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
             'ticket_key': 'PDI-11735'}, res)
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(4, len(additional_references))
        ref = additional_references.last()
        self.assertEqual('PDI-11735', ref.reference_key)

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
                         request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_create_pangaea_jira_ticket_task_client_error(self, mock_requests):
        submission = Submission.objects.get(pk=1)

        self.assertEqual(3, len(submission.additionalreference_set.all()))

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 400
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = create_pangaea_jira_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db'

            }
        )
        self.assertTrue(result.successful())
        self.assertIsNone(result.get())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(3, len(additional_references))

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
                         request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_create_pangaea_jira_ticket_task_server_error(self, mock_requests):
        submission = Submission.objects.get(pk=1)

        self.assertEqual(3, len(submission.additionalreference_set.all()))

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 500
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = create_pangaea_jira_ticket_task.apply_async(
            kwargs={
                'submission_id': submission.pk,
                'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db'

            }
        )
        self.assertFalse(result.successful())
        additional_references = submission.additionalreference_set.all()
        self.assertEqual(3, len(additional_references))

        request_logs = RequestLog.objects.all()
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual('https://issues.pangaea.de/rest/api/2/issue/',
                         request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_attach_file_to_pangaea_ticket_task_success(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '[{"self":"http://issues.pangaea.de/rest/api/2/attachment/49860","id":"49860","filename":"report.csv","author":{"self":"http://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"http://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"http://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"http://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"http://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-02-26T14:47:46.000+0000","size":38,"content":"http://issues.pangaea.de/secure/attachment/49860/report.csv"}]'
        result = attach_file_to_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                }
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
             'ticket_key': 'PDI-11735'}, res)

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/attachments',
            request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_attach_file_to_pangaea_ticket_task_client_error(self,
                                                             mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 400
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = attach_file_to_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                }
            }
        )
        res = result.get()
        self.assertTrue(result.successful())
        self.assertDictEqual(
            {'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
             'ticket_key': 'PDI-11735'}, res)

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/attachments',
            request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_attach_file_to_pangaea_ticket_task_server_error(self,
                                                             mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 500
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = attach_file_to_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                }
            }
        )
        self.assertFalse(result.successful())

        request_logs = RequestLog.objects.all()
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/attachments',
            request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_comment_on_pangaea_ticket_task_success(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()
        sub.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"self":"http://issues.pangaea.de/rest/api/2/issue/31444/comment/72996","id":"72996","author":{"self":"http://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"http://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"http://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"http://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"http://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"body":"This should be some descripitive text regarding attached files, containing ENA-Accession numbers","updateAuthor":{"self":"http://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"http://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"http://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"http://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"http://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-02-26T14:47:46.982+0000","updated":"2016-02-26T14:47:46.982+0000"}'
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                },
                'comment_body': 'ACC 12345'
            }
        )
        res = result.get()
        self.assertTrue(result.successful())

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/comment',
            request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_comment_on_pangaea_ticket_task_client_error(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()
        sub.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 400
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                },
                'comment_body': 'ACC 12345'
            }
        )
        # expects resuls from previous chain element
        self.assertTrue(result.successful())

        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/comment',
            request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_comment_on_pangaea_ticket_task_server_error(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()
        sub.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )

        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))

        mock_requests.post.return_value.status_code = 500
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                },
                'comment_body': 'ACC 12345'
            }
        )
        self.assertFalse(result.successful())

        request_logs = RequestLog.objects.all()
        self.assertEqual(3, len(request_logs))
        self.assertEqual(RequestLog.OUTGOING, request_logs.first().type)
        self.assertEqual(
            'https://issues.pangaea.de/rest/api/2/issue/PDI-11735/comment',
            request_logs.first().url)

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_check_for_pangaea_doi_task_success(self, mock_requests):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'xxx'
        access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        access.save()

        persistent_identifiers = PersistentIdentifier.objects.all()
        self.assertEqual(0, len(persistent_identifiers))

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = textwrap.dedent(
            """<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")

        mock_requests.get.return_value.status_code = 200
        mock_requests.get.return_value.ok = True
        mock_requests.get.return_value.content = '{"expand":"renderedFields,names,schema,transitions,operations,editmeta,changelog","id":"33002","self":"https://issues.pangaea.de/rest/api/2/issue/33002","key":"PDI-12428","fields":{"issuetype":{"self":"https://issues.pangaea.de/rest/api/2/issuetype/6","id":"6","description":"Submission of data to PANGAEA","iconUrl":"https://issues.pangaea.de/images/icons/issuetypes/newfeature.png","name":"Data Submission","subtask":false},"timespent":null,"timeoriginalestimate":null,"description":null,"project":{"self":"https://issues.pangaea.de/rest/api/2/project/10010","id":"10010","key":"PDI","name":"PANGAEA Data Archiving & Publication","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/projectavatar?avatarId=10011","24x24":"https://issues.pangaea.de/secure/projectavatar?size=small&avatarId=10011","16x16":"https://issues.pangaea.de/secure/projectavatar?size=xsmall&avatarId=10011","32x32":"https://issues.pangaea.de/secure/projectavatar?size=medium&avatarId=10011"}},"aggregatetimespent":null,"resolution":null,"timetracking":{},"attachment":[{"self":"https://issues.pangaea.de/rest/api/2/attachment/53276","id":"53276","filename":"contextual_data.csv","author":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-06-02T10:38:06.000+0000","size":1502,"content":"https://issues.pangaea.de/secure/attachment/53276/contextual_data.csv"}],"aggregatetimeestimate":null,"resolutiondate":null,"workratio":-1,"summary":"Automated request by GFBio BrokerAgent","lastViewed":"2016-06-02T12:06:25.250+0000","watches":{"self":"https://issues.pangaea.de/rest/api/2/issue/PDI-12428/watchers","watchCount":0,"isWatching":false},"creator":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"subtasks":[],"created":"2016-06-02T10:37:50.000+0000","reporter":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"customfield_10120":null,"customfield_10220":null,"aggregateprogress":{"progress":0,"total":0},"priority":{"self":"https://issues.pangaea.de/rest/api/2/priority/3","iconUrl":"https://issues.pangaea.de/images/icons/priorities/major.png","name":"Major","id":"3"},"customfield_10122":null,"customfield_10320":null,"customfield_10002":"gfbio-broker","customfield_10420":null,"customfield_10003":{"self":"https://issues.pangaea.de/rest/api/2/customFieldOption/10000","value":"CC-BY: Creative Commons Attribution 3.0 Unported","id":"10000"},"customfield_10421":null,"customfield_10520":"doi:10.1594/PANGAEA.786576","labels":[],"customfield_10004":null,"timeestimate":null,"aggregatetimeoriginalestimate":null,"progress":{"progress":0,"total":0},"comment":{"startAt":0,"maxResults":1,"total":1,"comments":[{"self":"https://issues.pangaea.de/rest/api/2/issue/33002/comment/77173","id":"77173","author":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"body":"ENA Accession No. of study ERP015860. broker_submission_id: 9cb23074-689e-4058-a9e9-ccba1fe2ab1d. ","updateAuthor":{"self":"https://issues.pangaea.de/rest/api/2/user?username=gfbio-broker","name":"gfbio-broker","key":"gfbio-broker","emailAddress":"i.kostadinov@jacobs-university.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10072","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10072","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10072","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10072"},"displayName":"GFBio broker account","active":true,"timeZone":"Etc/UTC"},"created":"2016-06-02T10:38:22.000+0000","updated":"2016-06-02T10:38:22.000+0000"}]},"issuelinks":[],"worklog":{"startAt":0,"maxResults":20,"total":0,"worklogs":[]},"assignee":{"self":"https://issues.pangaea.de/rest/api/2/user?username=jfelden","name":"jfelden","key":"jfelden","emailAddress":"jfelden@marum.de","avatarUrls":{"48x48":"https://issues.pangaea.de/secure/useravatar?avatarId=10067","24x24":"https://issues.pangaea.de/secure/useravatar?size=small&avatarId=10067","16x16":"https://issues.pangaea.de/secure/useravatar?size=xsmall&avatarId=10067","32x32":"https://issues.pangaea.de/secure/useravatar?size=medium&avatarId=10067"},"displayName":"Janine Felden","active":true,"timeZone":"Europe/Berlin"},"updated":"2016-06-02T12:03:16.000+0000","status":{"self":"https://issues.pangaea.de/rest/api/2/status/1","description":"The issue is open and ready for the assignee to start work on it.","iconUrl":"https://issues.pangaea.de/images/icons/statuses/open.png","name":"Open","id":"1","statusCategory":{"self":"https://issues.pangaea.de/rest/api/2/statuscategory/2","id":2,"key":"new","colorName":"blue-gray","name":"To Do"}}}}'

        result = check_for_pangaea_doi_task.apply_async(
            kwargs={
                'resource_credential_id': access.pk
            }
        )
        self.assertTrue(result.successful())

        persistent_identifiers = PersistentIdentifier.objects.all()
        self.assertEqual(1, len(persistent_identifiers))

        pid = persistent_identifiers.first()
        self.assertEqual('PAN', pid.archive)
        self.assertEqual('DOI', pid.pid_type)
        self.assertEqual('doi:10.1594/PANGAEA.786576', pid.pid)

    # ---------------- CHAIN TESTS ---------------------------------------------

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_pangaea_chain(self, mock_requests):
        access = ResourceCredential()
        access.username = 'gfbio-broker'
        access.password = 'h_qB-RxCY)7y'
        access.url = 'https://ws.pangaea.de/ws/services/PanLogin'
        access.save()
        # with patch('config.celeryconfig.CELERY_ALWAYS_EAGER', True,
        #           create=True):
        # Test chain first transition
        # Result: token handed over correctly
        # mock_requests.post.return_value.status_code = 200
        # mock_requests.post.return_value.ok = True
        # mock_requests.post.return_value.content = textwrap.dedent("""<?xml version="1.0" encoding="UTF-8"?><soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><soapenv:Body><ns1:loginResponse soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:ns1="urn:java:de.pangaea.login.PanLogin"><loginReturn xsi:type="xsd:string">f3d7aca208aaec8954d45bebc2f59ba1522264db</loginReturn></ns1:loginResponse></soapenv:Body></soapenv:Envelope>""")
        # result = chain(
        #         request_pangaea_login_token_task.s(
        #                 submission_id=1,
        #                 resource_credential_id=access.pk),
        #         create_pangaea_jira_ticket_task.s(
        #             submission_id=1,
        #         )
        #
        # )()
        #
        # Result: attach file  works with kwargs ...
        mock_requests.post.return_value.status_code = 201
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"id":"31444","key":"PDI-11735","self":"http://issues.pangaea.de/rest/api/2/issue/31444"}'

        submission = Submission.objects.get(pk=1)

        result = chain(
            create_pangaea_jira_ticket_task.s(
                submission_id=1,
                login_token='f3d7aca208aaec8954d45bebc2f59ba1522264db'
            ),
            attach_file_to_pangaea_ticket_task.s(
                submission_id=1,
            )

        )()

    @responses.activate
    def test_initiate_submission_chain_success(self):
        len_auditable_text_datas = len(AuditableTextData.objects.all())
        sc = SiteConfiguration.objects.get(pk=1)
        data = json.dumps({
            'userid': 23
        })
        url = '{0}/api/jsonws/GFBioProject-portlet.userextension/get-user-by-id/request-json/{1}'.format(
            sc.gfbio_server.url, data)

        comment_url = '{0}{1}/{2}/{3}'.format(
            sc.helpdesk_server.url,
            HELPDESK_API_SUB_URL,
            'no_key_available',
            HELPDESK_COMMENT_SUB_URL,
        )

        responses.add(responses.POST, url, status=200,
                      json={"firstname": "Marc", "middlename": "",
                            "emailaddress": "maweber@mpi-bremen.de",
                            "fullname": "Marc Weber",
                            "screenname": "maweber", "userid": 16250,
                            "lastname": "Weber"})
        responses.add(responses.POST,
                      '{0}{1}'.format(sc.helpdesk_server.url,
                                      HELPDESK_API_SUB_URL
                                      ),
                      json={"bla": "blubb"},
                      status=200)
        responses.add(responses.POST,
                      comment_url,
                      json={"bla": "blubb"},
                      status=200)
        sub = FullWorkflowTest._prepare()
        sub.release = False
        sub.save()

        trigger_submission_transfer(submission_id=sub.id)

        self.assertEqual(len(AuditableTextData.objects.all()),
                         len_auditable_text_datas)

        sub.release = True
        sub.save()

        trigger_submission_transfer(submission_id=sub.id)
        self.assertGreater(len(AuditableTextData.objects.all()),
                           len_auditable_text_datas)


class TestSubmissionTransferHandler(TestCase):
    fixtures = ('user', 'submission', 'broker_object',
                'resource_credential', 'persistent_identifier',
                'site_configuration')

    def test_instance(self):
        transfer_handler = SubmissionTransferHandler(
            submission_id=1,
            target_archive='ENA'
        )
        self.assertIsInstance(transfer_handler, SubmissionTransferHandler)
        self.assertEqual(1, transfer_handler.submission_id)
        self.assertEqual('ENA', transfer_handler.target_archive)

    def test_get_submisssion_and_siteconfig_for_task(self):
        sub, conf = SubmissionTransferHandler.get_submisssion_and_siteconfig_for_task(
            submission_id=1)
        reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(reports))
        self.assertIsInstance(sub, Submission)
        self.assertIsInstance(conf, SiteConfiguration)

    @skip(
        'currently this method is not supposed to rise an exception, so task.chain can proceed in a controlled way')
    def test_invalid_submission_id(self):
        with self.assertRaises(
                SubmissionTransferHandler.TransferInternalError) as exc:
            sub, conf = SubmissionTransferHandler.get_submisssion_and_siteconfig_for_task(
                submission_id=99)

    def test_no_site_config(self):
        confs = SiteConfiguration.objects.all()
        sub = Submission.objects.get(pk=1)
        sub.site = User.objects.get(pk=2)
        sub.save()
        sub, conf = SubmissionTransferHandler.get_submisssion_and_siteconfig_for_task(
            submission_id=1)
        reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(reports))
        self.assertIsInstance(conf, SiteConfiguration)
        self.assertEqual('default', conf.title)

    def test_no_site_config_without_default(self):
        site_config = SiteConfiguration.objects.get(pk=2)
        site_config.delete()
        submission = Submission.objects.get(pk=1)
        # submission.on_hold = True
        submission.site = User.objects.get(pk=2)
        submission.save()
        with self.assertRaises(
                SubmissionTransferHandler.TransferInternalError) as exc:
            sub, conf = SubmissionTransferHandler.get_submisssion_and_siteconfig_for_task(
                submission_id=1)

    def test_raise_400_exception(self):
        response = requests.models.Response()
        response.status_code = 401
        response._content = '{}'
        with self.assertRaises(
                SubmissionTransferHandler.TransferClientError) as exc:
            SubmissionTransferHandler.raise_response_exceptions(response)

    def test_raise_500_exception(self):
        response = requests.models.Response()
        response.status_code = 500
        response._content = '{}'
        with self.assertRaises(
                SubmissionTransferHandler.TransferServerError) as exc:
            SubmissionTransferHandler.raise_response_exceptions(response)

    @patch('gfbio_submissions.brokerage.utils.ena.requests')
    def test_execute_ena_only(self, mock_requests):
        sth = SubmissionTransferHandler(submission_id=1, target_archive='ENA')
        # with patch('config.celeryconfig.CELERY_ALWAYS_EAGER', True,
        #            create=True):
        mock_requests.post.return_value.status_code = 201
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{}'
        # FIXME: No Idea what is supposed to happen here, compare in genomicsdataservices test
        # with self.assertRaises(AttributeError) as exc:
        #     sth.execute_submission_to_ena()
        sth.execute_submission_to_ena()

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    @patch('gfbio_submissions.brokerage.utils.ena.requests')
    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_execute_ena_pangaea(self, mock_requests, m2, m3):
        sth = SubmissionTransferHandler(submission_id=1,
                                        target_archive='ENA_PANGAEA')
        # try:
        # with patch('config.celeryconfig.CELERY_ALWAYS_EAGER', True,
        #           create=True):
        sub = Submission.objects.get(pk=1)
        sub.additionalreference_set.create(
            type=AdditionalReference.PANGAEA_JIRA_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        mock_requests.post.return_value.status_code = 201
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"a": 2}'
        # FIXME: No Idea what is supposed to happen here, compare in genomicsdataservices test
        # with self.assertRaises(AttributeError) as exc:
        #     sth.execute_submission_to_ena_and_pangaea()
        sth.execute_submission_to_ena_and_pangaea()


class TestSubmissionFileUpload(APITestCase):
    fixtures = ['user', 'submission', ]

    def _create_test_data(self, path):
        self._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'file': f,
        }

    @staticmethod
    def _delete_test_data():
        SubmissionFileUpload.objects.all().delete()

    def test_valid_file_upload(self):
        sub = Submission.objects.all().first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = self._create_test_data('/tmp/test_upload')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(b'broker_submission_id', response.content)
        self.assertIn(b'site', response.content)
        self.assertEqual(User.objects.get(pk=2).username, response.data['site'])
        self.assertIn(b'file', response.content)
        self.assertTrue(
            urlparse(response.data['file']).path.startswith(MEDIA_URL))

    def test_no_submission_upload(self):
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': uuid4()})
        data = self._create_test_data('/tmp/test_upload')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn(b'No submission', response.content)

    def test_empty_upload(self):
        sub = Submission.objects.all().first()
        url = reverse('brokerage:submissions_upload', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = self._create_test_data('/tmp/test_upload')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, {}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(b'No file was submitted.', response.content)


class TestPrimaryDataFile(APITestCase):
    fixtures = ['user', 'submission', 'site_configuration', 'user',
                'resource_credential', ]

    @classmethod
    def _create_test_data(cls, path, delete=True):
        if delete:
            cls._delete_test_data()
        f = open(path, 'w')
        f.write('test123\n')
        f.close()
        f = open(path, 'rb')
        return {
            'data_file': f,
        }

    @staticmethod
    def _delete_test_data():
        PrimaryDataFile.objects.all().delete()

    def test_empty_relation(self):
        sub = Submission.objects.first()
        pd = sub.primarydatafile_set.first()
        self.assertIsNone(pd)

    def test_valid_file_upload(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = self._create_test_data('/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=2))

        reports_len = len(TaskProgressReport.objects.all())

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn(b'broker_submission_id', response.content)
        self.assertIn(b'"id"', response.content)
        self.assertIn(b'site', response.content)
        self.assertEqual(User.objects.get(pk=2).username, response.data['site'])
        self.assertIn(b'data_file', response.content)
        self.assertTrue(
            urlparse(response.data['data_file']).path.startswith(MEDIA_URL))

        self.assertGreater(len(TaskProgressReport.objects.all()), reports_len)

    def test_no_permission_file_upload(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = self._create_test_data('/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=3))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        self.assertEqual(403, response.status_code)

    def test_not_owner_file_upload(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        sub.site = User.objects.get(pk=3)
        sub.save()
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = self._create_test_data('/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')
        # FIXME: until changed, everyone with permissions can add file, even if not owner of respective submission
        self.assertEqual(201, response.status_code)

    def test_get_list(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        token = Token.objects.create(user=User.objects.get(pk=2))
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        response = client.get(url)
        self.assertEqual(405, response.status_code)

    def test_get_detail(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        token = Token.objects.create(user=User.objects.get(pk=2))
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        url = reverse('brokerage:submissions_primary_data_detail', kwargs={
            'broker_submission_id': sub.broker_submission_id, 'pk': 1})

        response = client.get(url)
        self.assertEqual(405, response.status_code)

    def test_wrong_submission_put(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        token = Token.objects.create(user=User.objects.get(pk=2))
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        data = self._create_test_data('/tmp/test_primary_data_file_1111')
        response = client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(PrimaryDataFile.objects.all()))
        fname = PrimaryDataFile.objects.all().first().data_file.name
        self.assertIn('test_primary_data_file_1111', fname)

        content = json.loads(response.content.decode('utf-8'))
        sub = Submission.objects.all().last()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY_2',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data_detail', kwargs={
            'broker_submission_id': sub.broker_submission_id,
            'pk': content.get('id')})

        data = self._create_test_data('/tmp/test_primary_data_file_2222', False)
        response = client.put(url, data, format='multipart')
        self.assertEqual(400, response.status_code)

    def test_valid_file_put(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        token = Token.objects.create(user=User.objects.get(pk=2))
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)

        data = self._create_test_data('/tmp/test_primary_data_file_1111')
        response = client.post(url, data, format='multipart')
        self.assertEqual(201, response.status_code)
        self.assertEqual(1, len(PrimaryDataFile.objects.all()))
        fname = PrimaryDataFile.objects.all().first().data_file.name
        self.assertIn('test_primary_data_file_1111', fname)

        content = json.loads(response.content.decode('utf-8'))
        url = reverse('brokerage:submissions_primary_data_detail', kwargs={
            'broker_submission_id': sub.broker_submission_id,
            'pk': content.get('id')})

        data = self._create_test_data('/tmp/test_primary_data_file_2222', False)
        response = client.put(url, data, format='multipart')
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(PrimaryDataFile.objects.all()))
        fname = PrimaryDataFile.objects.all().first().data_file.name
        self.assertIn('test_primary_data_file_2222', fname)

    def test_no_submission_upload(self):
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': uuid4()})
        data = self._create_test_data('/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn(b'No submission', response.content)

    def test_empty_upload(self):
        sub = Submission.objects.all().first()
        sub.additionalreference_set.create(
            type=AdditionalReference.GFBIO_HELPDESK_TICKET,
            reference_key='FAKE_KEY',
            primary=True
        )
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = self._create_test_data('/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, {}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(b'No file was submitted.', response.content)


class TestAuditableTextData(TestCase):
    fixtures = ('user', 'submission', 'broker_object',
                'resource_credential', 'additional_reference',
                'site_configuration')

    def test_instance(self):
        sub = Submission.objects.get(pk=1)
        atd = AuditableTextData.objects.create(
            name='test-file',
            submission=sub
        )
        self.assertFalse(atd.pk is None)
        self.assertIsInstance(atd, AuditableTextData)

    def test_store_ena_data_as_auditable_text_data(self):
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(0, len(all_text_data))
        sub = FullWorkflowTest._prepare()
        data = prepare_ena_data(sub)
        store_ena_data_as_auditable_text_data(sub, data)
        all_text_data = AuditableTextData.objects.all()
        self.assertEqual(4, len(all_text_data))
        text_data_for_submission = AuditableTextData.objects.filter(
            submission=sub)
        self.assertEqual(4, len(text_data_for_submission))

    def test_manager_assemble_ena_submission_data(self):
        sub = FullWorkflowTest._prepare()
        data = prepare_ena_data(sub)
        store_ena_data_as_auditable_text_data(sub, data)
        res = AuditableTextData.objects.assemble_ena_submission_data(
            submission=sub)
        request_file_keys = ['SAMPLE', 'STUDY', 'EXPERIMENT', 'RUN']
        self.assertEqual(sorted(request_file_keys), sorted(list(res.keys())))

    def test_manager_submission_data_no_experiments_no_runs(self):
        sub = FullWorkflowTest._prepare()
        data = prepare_ena_data(sub)
        data.pop('EXPERIMENT')
        data.pop('RUN')
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_ena_data_as_auditable_text_data(sub, data)
        self.assertEqual(2, len(AuditableTextData.objects.all()))
        res = AuditableTextData.objects.assemble_ena_submission_data(
            submission=sub)
        request_file_keys = ['SAMPLE', 'STUDY', ]
        self.assertEqual(sorted(request_file_keys), sorted(list(res.keys())))

    def test_manager_submission_filter(self):
        sub = FullWorkflowTest._prepare()
        data = prepare_ena_data(sub)
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_ena_data_as_auditable_text_data(sub, data)
        self.assertEqual(4, len(AuditableTextData.objects.all()))
        self.assertEqual(4,
                         len(AuditableTextData.objects.filter(submission=sub)))

        sub2 = FullWorkflowTest._prepare()
        data = prepare_ena_data(sub2)
        store_ena_data_as_auditable_text_data(sub2, data)
        self.assertEqual(8, len(AuditableTextData.objects.all()))
        self.assertEqual(4,
                         len(AuditableTextData.objects.filter(submission=sub2)))

    def test_manager_invalid_submission(self):
        sub = FullWorkflowTest._prepare()
        data = prepare_ena_data(sub)
        self.assertEqual(0, len(AuditableTextData.objects.all()))
        store_ena_data_as_auditable_text_data(sub, data)
        self.assertEqual(4, len(AuditableTextData.objects.all()))
        self.assertEqual(4,
                         len(AuditableTextData.objects.filter(submission=sub)))

        sub2 = FullWorkflowTest._prepare()
        self.assertEqual(0,
                         len(AuditableTextData.objects.filter(submission=sub2)))

        res = AuditableTextData.objects.assemble_ena_submission_data(
            submission=sub2)
        self.assertDictEqual({}, res)

        # def test_serialization(self):
    #     sub = Submission.objects.first()
    #
    #     # single object get nicht
    #     # data = serializers.serialize("xml", sub)
    #
    #     # fake als iterable list kappt
    #     # querysets natürlich auch object.all()
    #     # fields: data = serializers.serialize('xml', SomeModel.objects.all(), fields=('name','size'))
    #     data = serializers.serialize("xml", [sub, ])
    #     dxml = xml.dom.minidom.parseString(data)
    #     d = dxml.toprettyxml()
    #     print d
    #     print '\n-----------------------------\n'
    #     data = serializers.serialize("json", [sub, ])
    #     d = json.loads(data)
    #     pprint(d)
    #
    #     # This is useful if you want to serialize data directly to a file-like object (which includes an HttpResponse):
    #     # with open("file.xml", "w") as out:
    #     #     xml_serializer.serialize(SomeModel.objects.all(), stream=out)
    #     XMLSerializer = serializers.get_serializer("xml")
    #     xml_serializer = XMLSerializer()
    #     xml_serializer.serialize(Submission.objects.filter(
    #         broker_submission_id=sub.broker_submission_id))
    #     data = xml_serializer.getvalue()
    #     dxml = xml.dom.minidom.parseString(data)
    #     d = dxml.toprettyxml()
    #     print '\n-----------------------------\n'
    #     print d
    #
    #     XMLSerializer = serializers.get_serializer("json")
    #     xml_serializer = XMLSerializer()
    #     xml_serializer.serialize(Submission.objects.filter(
    #         broker_submission_id=sub.broker_submission_id))
    #     data = xml_serializer.getvalue()
    #     d = json.loads(data)
    #     print '\n-----------------------------\n'
    #     pprint(d)
    #
    # def test_on_save_serialization(self):
    #     # self serialization: this works with json, works not with xml
    #     # I guess one or more fields are not allowd to be blank
    #     print '\n############\tCREATE\t###########\n'
    #     sub = Submission()
    #     data = sub.save()
    #     print data
    #     print '\n############\tUpdate\t###########\n'
    #     sub.target = 'ENA'
    #     data = sub.save()
    #     print data
    #
    #     # yepp its the empty json-data that makes xml serialization crash on blank values,
    #     # at least with default postgres json
    #     # sub = Submission()
    #     # sub.data = '{"bla": "blubb"}'
    #     # data = sub.save()
    #     # print '\n#######################\n'
    #     # print data
    #
    #     # this works with self serialization
    #     # sub = Submission.objects.first()
    #     # sub.download_url = 'http://www.myhorseisamazing.com'
    #     # data = sub.save()
    #     # print data
    #
    # def test_deserialize_jsonfile(self):
    #     with open(
    #             '/git-python-test/6_10154447-d0a8-4c38-b92a-0ea84d10678a.json',
    #             'rb') as dump:
    #         content = dump.read()
    #         print content
    #
    #     for obj in serializers.deserialize('json', content,
    #                                        cls=DjangoJSONEncoder):
    #         print obj
    #         obj.save()


class TestHelpDeskTicketMethods(TestCase):
    fixtures = ('user', 'submission', 'broker_object',
                'resource_credential', 'additional_reference',
                'site_configuration')

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_create_helpdesk_ticket(self, mock_requests):
        config = SiteConfiguration.objects.get(pk=1)
        sub = Submission.objects.get(pk=1)

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"a": true}'

        self.assertEqual(0, len(RequestLog.objects.all()))

        response = gfbio_helpdesk_create_ticket(
            site_config=config,
            submission=sub,
        )
        # no actual test, but method runs without bugs
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_create_helpdesk_ticket_unicode_text(self, mock_requests):
        config = SiteConfiguration.objects.get(pk=1)
        sub = Submission.objects.get(pk=1)

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"a": true}'

        self.assertEqual(0, len(RequestLog.objects.all()))

        response = gfbio_helpdesk_create_ticket(
            site_config=config,
            submission=sub,
        )
        # no actual test, but method runs without bugs
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_comment_on_helpdesk_ticket(self, mock_requests):
        config = SiteConfiguration.objects.get(pk=1)

        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '{"a": true}'

        self.assertEqual(0, len(RequestLog.objects.all()))

        response = gfbio_helpdesk_comment_on_ticket(
            site_config=config,
            ticket_key='SAND-23',
            comment_body='body',
            submission=Submission.objects.first()
        )
        # no actual test, but method runs without bugs
        self.assertEqual(200, response.status_code)
        self.assertEqual(1, len(RequestLog.objects.all()))

    @skip('request to helpdesk server')
    def test_attach_to_real_ticket(self):
        rc = ResourceCredential()
        rc.url = 'https://helpdesk.gfbio.org'
        rc.username = 'brokeragent'
        rc.password = 'puN;7_k[-"_,ZiJi'
        rc.save()

        sc = SiteConfiguration.objects.get(pk=1)
        sc.helpdesk_server = rc
        sc.save()

        sub = Submission.objects.all().first()
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = TestPrimaryDataFile._create_test_data(
            '/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        pd = sub.primarydatafile_set.first()
        response = gfbio_helpdesk_attach_file_to_ticket(sc, 'SAND-959',
                                                        pd.data_file, sub)
        # https://helpdesk.gfbio.org/browse/SAND-959

        # 200
        # [{"self": "https://helpdesk.gfbio.org/rest/api/2/attachment/10814",
        #   "id": "10814", "filename": "test_primary_data_file_TE4k513",
        #   "author": {
        #       "self": "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent",
        #       "name": "brokeragent", "key": "brokeragent@gfbio.org",
        #       "emailAddress": "brokeragent@gfbio.org", "avatarUrls": {
        #           "48x48": "https://helpdesk.gfbio.org/secure/useravatar?avatarId=10349",
        #           "24x24": "https://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10349",
        #           "16x16": "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10349",
        #           "32x32": "https://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10349"},
        #       "displayName": "Broker Agent", "active": true,
        #       "timeZone": "Europe/Berlin"},
        #   "created": "2017-06-19T09:23:43.000+0000", "size": 8,
        #   "content": "https://helpdesk.gfbio.org/secure/attachment/10814/test_primary_data_file_TE4k513"}]

    @patch('gfbio_submissions.brokerage.utils.gfbio.requests')
    def test_attach_template_to_helpdesk_ticket(self, mock_requests):
        sub = Submission.objects.all().first()
        sc = SiteConfiguration.objects.get(pk=1)
        url = reverse('brokerage:submissions_primary_data', kwargs={
            'broker_submission_id': sub.broker_submission_id})
        data = TestPrimaryDataFile._create_test_data(
            '/tmp/test_primary_data_file')
        token = Token.objects.create(user=User.objects.get(pk=2))

        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION='Token ' + token.key)
        response = client.post(url, data, format='multipart')

        sub = Submission.objects.all().first()
        primary_data_files = PrimaryDataFile.objects.all()
        request_logs = RequestLog.objects.all()
        self.assertEqual(0, len(request_logs))
        mock_requests.post.return_value.status_code = 200
        mock_requests.post.return_value.ok = True
        mock_requests.post.return_value.content = '[{"self": "https://helpdesk.gfbio.org/rest/api/2/attachment/10814", "id": "10814", "filename": "test_primary_data_file_TE4k513", "author": { "self": "https://helpdesk.gfbio.org/rest/api/2/user?username=brokeragent", "name": "brokeragent", "key": "brokeragent@gfbio.org", "emailAddress": "brokeragent@gfbio.org", "avatarUrls": { "48x48": "https://helpdesk.gfbio.org/secure/useravatar?avatarId=10349", "24x24": "https://helpdesk.gfbio.org/secure/useravatar?size=small&avatarId=10349", "16x16": "https://helpdesk.gfbio.org/secure/useravatar?size=xsmall&avatarId=10349", "32x32": "https://helpdesk.gfbio.org/secure/useravatar?size=medium&avatarId=10349"}, "displayName": "Broker Agent", "active": true, "timeZone": "Europe/Berlin"}, "created": "2017-06-19T09:23:43.000+0000", "size": 8, "content": "https://helpdesk.gfbio.org/secure/attachment/10814/test_primary_data_file_TE4k513"}]'

        pd = sub.primarydatafile_set.first()
        response = gfbio_helpdesk_attach_file_to_ticket(sc, 'SAND-959',
                                                        pd.data_file, sub)
        self.assertEqual(200, response.status_code)
        request_logs = RequestLog.objects.all()
        self.assertEqual(1, len(request_logs))


class TestTaskProgressReport(TestCase):
    fixtures = ('user', 'submission',)

    def test_instance(self):
        self.assertEqual(0, len(TaskProgressReport.objects.all()))
        sub = Submission.objects.get(pk=1)
        tpr = TaskProgressReport.objects.create(
            submission=sub,
            task_name='foo',
        )
        tpr.save()
        self.assertEqual(1, len(TaskProgressReport.objects.all()))

    def test_str(self):
        tpr = TaskProgressReport.objects.create(
            submission=Submission.objects.get(pk=1),
            task_name='foo',
        )
        tpr.save()
        self.assertEqual('foo', tpr.__str__())
        self.assertIsInstance(tpr.__str__(), str)


class TestSubmissionTask(TestCase):
    fixtures = ('user', 'submission', 'broker_object',
                'resource_credential', 'additional_reference',
                'site_configuration')

    @staticmethod
    def _run_task(submission_id=1):
        result = create_broker_objects_from_submission_data_task.apply_async(
            kwargs={
                'submission_id': submission_id
            }
        )

    def test_create(self):
        report = TaskProgressReport()
        report.save()
        reports = TaskProgressReport.objects.all()
        self.assertEqual(1, len(reports))

    @patch('gfbio_submissions.brokerage.utils.pangaea.requests')
    def test_create_with_retry_task(self, mock_requests):
        sub = FullWorkflowTest._prepare()
        sub.submitting_user = 'gfbio'
        sub.save()
        sub.brokerobject_set.filter(
            type='study').first().persistentidentifier_set.create(
            archive='ENA',
            pid_type='PRJ',
            pid='PRJEB20411',
            outgoing_request_id=uuid.uuid4()
        )

        reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(reports))

        mock_requests.post.return_value.status_code = 500
        mock_requests.post.return_value.ok = False
        mock_requests.post.return_value.content = ''
        result = comment_on_pangaea_ticket_task.apply_async(
            kwargs={
                'submission_id': sub.pk,
                'kwargs': {
                    'login_token': 'f3d7aca208aaec8954d45bebc2f59ba1522264db',
                    'ticket_key': 'PDI-11735'
                },
                'comment_body': 'ACC 12345'
            }
        )

        reports = TaskProgressReport.objects.all()
        self.assertEqual(1, len(reports))
        report = reports.first()
        self.assertEqual('RETRY', report.status)
        self.assertEqual('500', report.task_exception)

    def test_task_report_creation(self):
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(0, len(task_reports))

        self._run_task()

        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(1, len(task_reports))
        self.assertEqual(
            'tasks.create_broker_objects_from_submission_data_task',
            task_reports.first().task_name
        )

    def test_task_report_update_after_return(self):
        self._run_task(submission_id=1)
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(1, len(task_reports))
        tpr = task_reports.first()
        self.assertEqual('SUCCESS', tpr.status)
        self.assertNotEqual('', tpr.task_kwargs)

    def test_task_report_update_invalid_task_id(self):
        self._run_task(submission_id=1)

        report, created = TaskProgressReport.objects.update_report_after_return(
            status='TEST',
            task_id=uuid4(),
        )

        self.assertTrue(created)
        self.assertEqual('unnamed_task', report.__str__())

    def test_task_report_update_on_wrong_submission(self):
        self._run_task(submission_id=1111)
        task_reports = TaskProgressReport.objects.all()
        self.assertEqual(1, len(task_reports))
        tpr = task_reports.first()
        self.assertEqual('SUCCESS', tpr.status)
        self.assertEqual('CANCELLED', tpr.task_return_value)


class TestDownloadEnaReport(TestCase):
    fixtures = ('user', 'broker_object', 'submission', 'resource_credential',
                'persistent_identifier', 'site_configuration',)

    # TODO: remove later, since real credentials are needed
    # TODO: mock ftp request -> https://stackoverflow.com/questions/35654355/mocking-ftp-in-unit-test
    @skip('real request to ena ftp unit mock is in place')
    def test_ftp_access(self):
        rc = ResourceCredential.objects.create(
            title='ena_ftp',
            url='webin.ebi.ac.uk',
            authentication_string='',
            username='Webin-40945',
            password='EgjPKns',
            comment='',
        )
        site_conf = SiteConfiguration.objects.get(pk=1)
        site_conf.ena_ftp = rc
        site_conf.save()

        decompressed_file = io.StringIO()
        report = download_submitted_run_files_to_stringIO(
            site_config=site_conf,
            decompressed_io=decompressed_file,
        )
        self.assertTrue(len(report) > 0)
        decompressed_file.seek(0)
        reader = csv.DictReader(decompressed_file, delimiter=str('\t'))
        row = reader.next()
        self.assertTrue('STUDY_ID' in row.keys())
        decompressed_file.close()


class SchemaValidationTest(TestCase):
    # https://github.com/Julian/jsonschema
    @skip('files not available')
    def test_draft04_flat_validation(self):
        rel_path = os.path.join(
            'gfbio_submissions/brokerage/test_data/',
            'flat_draft04_schema.json')
        with open(rel_path, 'r') as schema_file:
            schema = json.load(schema_file)
        validator = jsonschema.Draft4Validator(schema)

        data = {}
        data_valid = validator.is_valid(data)
        self.assertFalse(data_valid)

        data = {
            'id': 18,
            'name': 'Horst',
            'the-address': {}
        }
        data_valid = validator.is_valid(data)

    # TODO: docker-compose -f dev.yml run django python manage.py collectstatic
    def test_mrr_validation(self):
        rel_path = os.path.join(
            settings.STATIC_ROOT, 'schemas',
            'minimal_requirements.json')
        abs_path = os.path.abspath(rel_path)

        with open(rel_path, 'r') as schema_file:
            schema = json.load(schema_file)
        validator = jsonschema.Draft4Validator(schema)

        data = {
            'requirements': {}
        }
        data_valid = validator.is_valid(data)
        self.assertFalse(data_valid)

        data = {
            'requirements': {
                'title': '123456',
                'description': '123456',
                'author': '123456'
            }
        }
        data_valid = validator.is_valid(data)
        self.assertTrue(data_valid)

    def test_ena_validation(self):
        rel_path = os.path.join(settings.STATIC_ROOT, 'schemas',
                                'ena_requirements.json')
        with open(rel_path, 'r') as schema_file:
            schema = json.load(schema_file)
        validator = jsonschema.Draft4Validator(schema)
        data = {
            'requirements': {
                'title': '123456',
                'description': '123456',
                'samples': 12
            }
        }
        data_valid = validator.is_valid(data)
        self.assertFalse(data_valid)

        data = {
            'requirements': {
                'title': 'test-1',
                'description': 'unit test test-data',
                'study_type': 'Metagenomics',
                'samples': [
                    {
                        'sample_alias': 'sample_x123',
                        'sample_title': 'Sample 1',
                        'taxon_id': 12
                    },
                    {
                        'sample_alias': 'sample_y456',
                        'sample_title': 'Sample 2',
                        'description': 'Very verbose description.',
                        'taxon_id': 34
                    }
                ],
                "experiments": [
                    {
                        'experiment_alias': 'experiment_jp456',
                        'platform': 'AB 3730xL Genetic Analyzer',
                        'design': {
                            'sample_descriptor': 'sample_y456',
                            'library_descriptor': {
                                'library_strategy': 'AMPLICON',
                                'library_source': 'METAGENOMIC',
                                'library_selection': 'PCR',
                                'library_layout': {
                                    'layout_type': 'paired',
                                    'nominal_length': 450
                                }
                            }
                        }
                    },
                    {
                        'experiment_alias': 'experiment_oo789',
                        'platform': 'AB 3730xL Genetic Analyzer',
                        'files': {
                            'forward_read_file_name': 'File4.forward.fastq.gz',
                            'reverse_read_file_name': 'File4.reverse.fastq.gz',
                            'forward_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75d1',
                            'reverse_read_file_checksum': '197bb2c9becec16f66dc5cf9e1fa75df'
                        },
                        'design': {
                            'sample_descriptor': 'sample_x123',
                            'library_descriptor': {
                                'library_strategy': 'AMPLICON',
                                'library_source': 'METAGENOMIC',
                                'library_selection': 'PCR',
                                'library_layout': {
                                    'layout_type': 'paired',
                                    'nominal_length': 450
                                }
                            }
                        }
                    }
                ],
                'runs': [
                    {
                        'experiment_ref': 'experiment_jp456',
                        'data_block': {
                            'files': [
                                {
                                    'filename': 'aFile',
                                    'filetype': 'fastq',
                                    'checksum_method': 'MD5',
                                    'checksum': '12345'
                                }
                            ]
                        }
                    }
                ]
            }
        }
        data_valid = validator.is_valid(data)
        self.assertTrue(data_valid)


class JsonDictFieldTest(TestCase):
    fixtures = (
        'user', 'submission',
    )

    def test_submission_data_escape_situation(self):
        sub = SubmissionTest._prepare_entities_with_runs(
            create_broker_objects=False)
        self.assertTrue(isinstance(sub.data, dict))
        serialized_data = json.dumps(sub.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count('\\'))
        sub.save()
        self.assertTrue(isinstance(sub.data, dict))
        serialized_data = json.dumps(sub.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count('\\'))

        sub.save()
        self.assertTrue(isinstance(sub.data, dict))
        serialized_data = json.dumps(sub.data)
        self.assertTrue(type(serialized_data) == str)
        self.assertEqual(0, serialized_data.count('\\'))

    def test_search_submission_data(self):
        sub = SubmissionTest._prepare_entities_with_runs(
            create_broker_objects=False)
        submissions = Submission.objects.all()
        qs = Submission.objects.filter(data__requirements__title='123456')
        self.assertEqual(1, len(qs))
        self.assertEqual(sub.broker_submission_id,
                         qs.first().broker_submission_id)

        qs = Submission.objects.filter(data__requirements__has_key='custom_key')
        self.assertEqual(0, len(qs))

        sub.data['requirements']['custom_key'] = True
        sub.save()
        qs = Submission.objects.filter(data__requirements__has_key='custom_key')
        self.assertEqual(1, len(qs))

    def test_json_dict_field_on_broker_object(self):
        sub = SubmissionTest._prepare_entities_with_runs()
        request_id_fake = uuid.UUID('71d59109-695d-4172-a8be-df6fb3283857')
        study, samples, experiments, runs = sub.get_json_with_aliases(
            alias_postfix=request_id_fake)
        bo = BrokerObject()
        bo.type = 'study'
        bo.site = User.objects.all().first()
        bo.data = {}
        bo.save()
        json.dumps(bo.data)
        bo.data = {'first': 1, 'second': True}
        bo.save()

        qs = sub.brokerobject_set.filter(data__sample_title='stitle')

        bo.data = {'first': 1, 'second': str(uuid4())}
        bo.save()

        bo.data = '{"bla": 2}'
        bo.save()

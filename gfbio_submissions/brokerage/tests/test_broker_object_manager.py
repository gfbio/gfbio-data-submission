# -*- coding: utf-8 -*-
import json
import os
from collections import defaultdict

from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission, BrokerObject, \
    PersistentIdentifier
from gfbio_submissions.brokerage.serializers import SubmissionSerializer, \
    SubmissionDetailSerializer
from gfbio_submissions.users.models import User


class TestBrokerObjectManager(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(
            username="user1"
        )
        Submission.objects.create(
            site=user,
            status='OPEN',
            submitting_user='John Doe',
            site_project_id='prj001A',
            target='ENA',
            release=False,
            data={}
        )

    @classmethod
    def _get_test_data_dir_path(cls):
        return '{0}{1}gfbio_submissions{1}brokerage{1}tests{1}test_data'.format(
            os.getcwd(), os.sep, )

    @classmethod
    def _get_ena_data(cls, simple=False):
        if simple:
            with open(os.path.join(
                    cls._get_test_data_dir_path(),
                    'ena_data.json'), 'r') as data_file:
                return json.load(data_file)

        with open(os.path.join(
                cls._get_test_data_dir_path(),
                'ena_data_runs.json'), 'r') as data_file:
            return json.load(data_file)

    @classmethod
    def _get_parsed_ena_response(cls):
        with open(os.path.join(cls._get_test_data_dir_path(),
                               'ena_response.json'), 'r') as data_file:
            return json.load(data_file)

    @classmethod
    def _create_broker_object(cls):
        return BrokerObject.objects.add_entity(
            submission=Submission.objects.first(),
            entity_type='study',
            site=User.objects.first(),
            site_project_id='prj001',
            site_object_id='obj001',
            json_data={
                "center_name": "GFBIO",
                "study_type": "Metagenomics",
                "study_abstract": "Study abstract",
                "study_title": "study title",
                "study_alias": "study_alias_1",
                "site_object_id": "study_obj_1"
            }
        )

    @classmethod
    def _create_multiple_broker_objects(cls):
        data = cls._get_ena_data()
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': data
            }
        )
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        for i in range(0, len(broker_objects)):
            broker_objects[i].id = i + 1
            broker_objects[i].save()

    def tearDown(self):
        BrokerObject.objects.all().delete()
        PersistentIdentifier.objects.all().delete()

    def test_add_entity(self):
        BrokerObject.objects.add_entity(
            submission=Submission.objects.first(),
            entity_type='study',
            site=User.objects.first(),
            site_project_id='prj0002',
            site_object_id='obj000999',
            json_data={
                'center_name': 'GFBIO',
                'study_type': 'Metagenomics',
                'study_abstract': 'abs',
                'study_title': 't',
                'study_alias': 'a',
                'site_object_id': 'from_data_01'
            }
        )
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(1, len(broker_objects))
        self.assertEqual('study', broker_objects.first().type)

    def test_add_submission_std_serializer(self):
        data = self._get_ena_data()
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()

        self.assertEqual(17, len(broker_objects))
        self.assertEqual(17, len(
            BrokerObject.objects.filter(site_project_id='')))
        self.assertEqual(
            1,
            len(BrokerObject.objects.filter(
                site_project_id='').filter(type='study'))
        )
        self.assertEqual(
            5,
            len(BrokerObject.objects.filter(
                site_project_id='').filter(type='sample'))
        )
        self.assertEqual(
            5,
            len(BrokerObject.objects.filter(
                site_project_id='').filter(type='experiment'))
        )
        self.assertEqual(
            6,
            len(BrokerObject.objects.filter(
                site_project_id='').filter(type='run'))
        )

    def test_double_add_submission_std_serializer(self):
        data = self._get_ena_data()
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': data
            }
        )
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())

        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(17, len(broker_objects))

        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(17, len(broker_objects))

    def test_add_submission_min_validation_full_data(self):
        data = self._get_ena_data(simple=True)
        serializer = SubmissionSerializer(
            data={
                'target': 'ENA',
                'release': False,
                'data': data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.first())
        self.assertEqual('OPEN', submission.status)
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(0, len(broker_objects))

    def test_add_submission_min_validation_min_data(self):
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
        submission = serializer.save(site=User.objects.first())
        self.assertEqual('OPEN', submission.status)
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(0, len(broker_objects))

    def test_add_submission_detail_serializer(self):
        data = self._get_ena_data(simple=True)
        serializer = SubmissionDetailSerializer(
            data={
                'target': 'ENA',
                'release': True,
                'data': data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)

        broker_objects = BrokerObject.objects.all()
        self.assertEqual(5, len(broker_objects))
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

    def test_add_submission_detail_serializer_min_validation_full_data(self):
        data = self._get_ena_data(simple=True)
        serializer = SubmissionDetailSerializer(
            data={
                'target': 'ENA',
                'release': False,
                'data': data
            }
        )
        self.assertTrue(serializer.is_valid())
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(0, len(broker_objects))

    def test_add_submission_detail_serializer_min_validation_min_data(self):
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
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(0, len(broker_objects))

    def test_manager_add_submission_without_ids(self):
        data = self._get_ena_data(simple=True)
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())
        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(5, len(broker_objects))
        self.assertEqual(5, len(BrokerObject.objects.filter(
            site_project_id='')))
        broker_objects = BrokerObject.objects.filter(site_project_id='')
        for b in broker_objects:
            self.assertEqual('{}_{}'.format(b.site, b.pk), b.site_object_id)

    def test_manager_double_add_submission_without_ids(self):
        data = self._get_ena_data(simple=True)
        serializer = SubmissionSerializer(data={
            'target': 'ENA',
            'release': True,
            'data': data
        })
        serializer.is_valid()
        submission = serializer.save(site=User.objects.first())

        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(5, len(broker_objects))
        self.assertEqual(5, len(BrokerObject.objects.filter(
            site_project_id='')))

        BrokerObject.objects.add_submission_data(submission)
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(5, len(broker_objects))
        self.assertEqual(5, len(BrokerObject.objects.filter(
            site_project_id='')))

    def test_manager_add_submission_invalid_aliases(self):
        data = self._get_ena_data(simple=True)
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
        obj = BrokerObject.objects.add_entity(
            Submission.objects.first(),
            'study',
            User.objects.first(),
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
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(1, len(broker_objects))
        BrokerObject.objects.add_entity(
            Submission.objects.first(),
            'study',
            User.objects.first(),
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
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(1, len(broker_objects))

    def test_double_add_same_site_object_id(self):
        BrokerObject.objects.add_entity(
            Submission.objects.first(),
            'study',
            User.objects.first(),
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
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(1, len(broker_objects))
        BrokerObject.objects.add_entity(
            Submission.objects.first(),
            'study',
            User.objects.first(),
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
        broker_objects = BrokerObject.objects.all()
        self.assertEqual(1, len(broker_objects))

    def test_append_persistent_identifier(self):
        broker_object = self._create_broker_object()
        study = {
            'accession': 'ERP013438',
            'alias': '{0}:f844738b-3304-4db7-858d-b7e47b293bb2'.format(
                broker_object.id),
            'holdUntilDate': '2016-03-05Z',
            'status': 'PRIVATE'
        }
        persistent_identifier = \
            BrokerObject.objects.append_persistent_identifier(
                study, 'ENA', 'ACC')
        print('broker_object', broker_object)
        print(broker_object.id)
        print('pid_set ', broker_object.persistentidentifier_set.all())
        self.assertEqual(1, len(broker_object.persistentidentifier_set.all()))
        self.assertEqual(
            PersistentIdentifier.objects.first().pid,
            persistent_identifier.pid
        )

    def test_append_pid_with_corrupt_alias(self):
        broker_object = self._create_broker_object()
        study = {
            'accession': 'ERP013438',
            'alias': '666:f844738b-3304-4db7-858d-b7e47b293bb2',
            'holdUntilDate': '2016-03-05Z',
            'status': 'PRIVATE'
        }
        persistent_identifier = \
            BrokerObject.objects.append_persistent_identifier(
                study, 'ENA', 'ACC')
        self.assertIsNone(persistent_identifier)
        self.assertEqual(0, len(broker_object.persistentidentifier_set.all()))

    def test_append_pids_from_ena_response(self):
        self._create_multiple_broker_objects()
        parsed_response = self._get_parsed_ena_response()
        persistent_identifiers = BrokerObject.objects.append_pids_from_ena_response(
            parsed_response)
        self.assertEqual(8, len(persistent_identifiers))
        d = defaultdict(int)
        for pid in persistent_identifiers:
            d[pid.pid_type] += 1
        self.assertEqual(5, d['ACC'])
        self.assertEqual(3, d['BSA'])

    def test_add_pids_from_submitted_run_files(self):
        self._create_multiple_broker_objects()
        study = BrokerObject.objects.filter(type='study').first()
        with open(os.path.join(
                self._get_test_data_dir_path(),
                'submitted_run_files.txt'), 'r') as data:
            BrokerObject.objects.add_downloaded_pids_to_existing_broker_objects(
                study_pid='ERP019479',
                decompressed_file=data
            )
        self.assertEqual(1, len(study.persistentidentifier_set.all()))
        self.assertEqual('ERP019479',
                         study.persistentidentifier_set.first().pid)

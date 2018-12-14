# -*- coding: utf-8 -*-
import copy
import json
import os

from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission, BrokerObject
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

    def tearDown(self):
        BrokerObject.objects.all().delete()

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

    def test_manager_add_submission_data_invalid_aliases(self):
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


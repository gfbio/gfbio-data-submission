# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.users.models import User
from ...models.broker_object import BrokerObject


class BrokerObjectTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        user = User.objects.create(username="user1")
        BrokerObject.objects.create(
            type="study",
            user=user,
            data={
                "center_name": "GFBIO",
                # 'study_type': 'Metagenomics',
                "study_abstract": "abstract",
                "study_title": "title",
                "study_alias": "alias",
                "site_object_id": "from_data_01",
            },
        )

    def test_db_object(self):
        self.assertEqual(1, len(BrokerObject.objects.all()))

    def test_instance(self):
        se = BrokerObject()
        self.assertTrue(isinstance(se, BrokerObject))

    def test_str(self):
        broker_object = BrokerObject.objects.first()
        self.assertEqual(
            "study_{0}".format(broker_object.object_id), broker_object.__str__()
        )

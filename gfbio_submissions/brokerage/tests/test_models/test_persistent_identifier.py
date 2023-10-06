# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.users.models import User
from ...models.broker_object import BrokerObject
from ...models.persistent_identifier import PersistentIdentifier


class PersistentIdentifierTest(TestCase):
    def setUp(self):
        user = User.objects.create(username="user1")
        broker_object = BrokerObject.objects.create(
            type="study",
            user=user,
            data={
                "center_name": "GFBIO",
                # 'study_type': 'Metagenomics',
                "study_abstract": "abstract",
                "study_title": "title",
                "study_alias": "alias",
            },
        )
        PersistentIdentifier.objects.get_or_create(
            archive="ENA",
            pid_type="ACC",
            broker_object=broker_object,
            pid="ACC_1234",
            outgoing_request_id="da76ebec-7cde-4f11-a7bd-35ef8ebe5b85",
        )

    def test_str(self):
        p = PersistentIdentifier.objects.all().first()
        self.assertEqual("ACC_1234", p.__str__())

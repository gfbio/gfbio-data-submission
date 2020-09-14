# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.brokerage.models import PersistentIdentifier, \
    BrokerObject
from gfbio_submissions.users.models import User


class TestInsdcResolveView(TestCase):

    # TODO: brokerobject fk is not allowed to be null

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password', )
        bo = BrokerObject.objects.create(
            type='study',
            user=user
        )
        for i in range(0, 10):
            pid = PersistentIdentifier.objects.create(
                archive='ENA',
                pid_type='ACC',
                status='PUBLIC' if i % 2 == 0 else '',
                broker_object=bo,
                pid='acc000{}'.format(i + 1)
            )

    def test_database_content(self):
        all_pids = PersistentIdentifier.objects.all()
        print(all_pids)
        self.assertEqual(10, len(all_pids))

    def test_get(self):
        response = self.client.get('/resolve/insdc/acc0001')
        print(response.status_code)
        print(response.content)
        print('\n----------------------\n')
        response = self.client.get('/resolve/insdc/acc000x')
        print(response.status_code)
        print(response.content)

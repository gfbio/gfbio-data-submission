# -*- coding: utf-8 -*-
from django.test import TestCase

from gfbio_submissions.brokerage.models import PersistentIdentifier, \
    BrokerObject
from gfbio_submissions.users.models import User


class TestInsdcResolveView(TestCase):

    @classmethod
    def setUpTestData(cls):
        user = User.objects.create_user(
            username='horst', email='horst@horst.de', password='password', )
        bo = BrokerObject.objects.create(
            type='study',
            user=user
        )
        cls.pid_values = []
        for i in range(0, 10):
            pid = PersistentIdentifier.objects.create(
                archive='ENA',
                pid_type='ACC',
                status='PUBLIC' if i % 2 == 0 else '',
                broker_object=bo,
                pid='acc000{}'.format(i + 1)
            )
            cls.pid_values.append(pid.pid)

    def test_database_content(self):
        all_pids = PersistentIdentifier.objects.all()
        self.assertEqual(10, len(all_pids))

    def test_get_200(self):
        response = self.client.get('/resolve/api/insdc/acc0002')
        self.assertEqual(200, response.status_code)
        self.assertIn(b'acc0002', response.content)

    def test_get_302(self):
        response = self.client.get('/resolve/api/insdc/acc0001')
        self.assertEqual(302, response.status_code)

    def test_get_404(self):
        response = self.client.get('/resolve/api/insdc/acc000x')
        self.assertEqual(404, response.status_code)
        self.assertIn(b'Not found', response.content)

    def test_get_status(self):
        pids = PersistentIdentifier.objects.all()
        for p in pids:
            response = self.client.get('/resolve/api/insdc/{}'.format(p.pid))
            if p.status == 'PUBLIC':
                self.assertEqual(302, response.status_code)
            else:
                self.assertEqual(200, response.status_code)

    def test_template_get_302(self):
        response = self.client.get('/resolve/insdc/acc0001')
        self.assertEqual(302, response.status_code)

    def test_template_get_200(self):
        response = self.client.get('/resolve/insdc/acc0002')
        self.assertEqual(200, response.status_code)

    def test_template_get_404(self):
        response = self.client.get('/resolve/insdc/acc000x')
        self.assertEqual(404, response.status_code)

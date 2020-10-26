# -*- coding: utf-8 -*-

import responses
from django.test import TestCase

from gfbio_submissions.brokerage.configuration.settings import \
    ENA_STUDY_URL_PREFIX
from gfbio_submissions.resolve.models import Accession


class TestAccessionModel(TestCase):

    def test_instance(self):
        acc = Accession.objects.create(identifier='ACC0815')
        self.assertIsInstance(acc, Accession)


class TestInsdcResolveView(TestCase):

    @classmethod
    def setUpTestData(cls):
        for i in range(0, 10):
            Accession.objects.create(identifier='acc000{}'.format(i + 1))

    def test_database_content(self):
        accs = Accession.objects.all()
        self.assertEqual(10, len(accs))

    def test_get_403(self):
        self.assertEqual('acc0001', Accession.objects.first().identifier)
        response = self.client.get('/resolve/api/insdc/acc0001')
        self.assertEqual(403, response.status_code)
        self.assertIn(b'acc0001', response.content)

    @responses.activate
    def test_get_302(self):
        responses.add(
            responses.GET,
            '{}{}'.format(ENA_STUDY_URL_PREFIX, 'acc000xxx'),
            status=200,
        )
        response = self.client.get('/resolve/api/insdc/acc000xxx')
        self.assertEqual(302, response.status_code)

    @responses.activate
    def test_template_get_302(self):
        responses.add(
            responses.GET,
            '{}{}'.format(ENA_STUDY_URL_PREFIX, 'acc0001xx'),
            status=200,
        )
        response = self.client.get('/resolve/insdc/acc0001xx')
        self.assertEqual(302, response.status_code)

    def test_template_get_403(self):
        response = self.client.get('/resolve/insdc/acc0002')
        self.assertEqual(403, response.status_code)

# -*- coding: utf-8 -*-
from django.test import TestCase


class SchemaViewTest(TestCase):

    def test_brokerage_schema_view(self):
        response = self.client.get('/generic/schema/brokerage/')
        self.assertEqual(200, response.status_code)

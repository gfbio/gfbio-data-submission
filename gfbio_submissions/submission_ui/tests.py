# -*- coding: utf-8 -*-
import json

import mock
from django.conf import settings
from django.test import TestCase


# class EnaWidgetDelieverSchemasAndOptionsTest(TestCase):
#
#     def test_simple_get_schema(self):
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/schema/study')
#         self.assertEqual(200, response.status_code)
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/schema/non_sense')
#         self.assertEqual(200, response.status_code)
#
#     def test_simple_get_options(self):
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/options/sample')
#         self.assertEqual(200, response.status_code)
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/options/non_sense')
#         self.assertEqual(200, response.status_code)
#
#     # TODO: move path to constant in dev_settings
#     @mock.patch.object(settings, 'STATIC_ROOT',
#                        'gfbio_submissions/submission_ui/fixtures')
#     def test_get_options_content(self):
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/options/sample')
#         content = json.loads(response.content.decode('utf-8'))
#         self.assertIn('fields', content.keys())
#
#     def test_get_options_invalid_param(self):
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/options/nope')
#         content = json.loads(response.content.decode('utf-8'))
#         self.assertEqual({}, content)
#
#     # TODO: move path to constant in dev_settings
#     @mock.patch.object(settings, 'STATIC_ROOT',
#                        'gfbio_submissions/submission_ui/fixtures')
#     def test_get_schema_content(self):
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/schema/study')
#         content = json.loads(response.content.decode('utf-8'))
#         self.assertIn('properties', content.keys())
#
#     def test_get_schema_invalid_param(self):
#         response = self.client.get(
#             '/brokerage/submissions/ena/form/schema/nope')
#         content = json.loads(response.content.decode('utf-8'))
#         self.assertEqual({}, content)

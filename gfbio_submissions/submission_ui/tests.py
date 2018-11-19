# -*- coding: utf-8 -*-
import json

import mock
from django.conf import settings
from django.test import TestCase


# class CheckListValidationViewTest(TestCase):
#
#     def test_get(self):
#         response = self.client.get('/validate_widget')
#         self.assertEqual(302, response.status_code)
#         self.assertEqual('widget', response['location'].split('/')[-1])
#
#     def test_post(self):
#         data = {'gcdjson': '{"key": "value"}'}
#         response = self.client.post('/validate_widget', data)
#         self.assertEqual(200, response.status_code)
#
# class GcdjWidgetDeliverSchemaTest(TestCase):
#
#     def test_simple_get_schema(self):
#         response = self.client.get('/widget_schemas/select')
#         self.assertEqual(200, response.status_code)
#
#     def test_simple_get_options(self):
#         response = self.client.get('/widget_options/select')
#         self.assertEqual(200, response.status_code)
#
#     # TODO: move path to constant in dev_settings
#     @mock.patch.object(settings, 'STATIC_ROOT', 'genomicsdataservices/gcdj_form/fixtures')
#     def test_get_options_content(self):
#         response = self.client.get('/widget_options/select')
#         content = json.loads(response.content)
#         self.assertIn('fields', content.keys())
#
#     def test_get_options_invalid_param(self):
#         response = self.client.get('/widget_options/nope')
#         content = json.loads(response.content)
#         self.assertEqual({}, content)
#
#     # TODO: move path to constant in dev_settings
#     @mock.patch.object(settings, 'STATIC_ROOT', 'genomicsdataservices/gcdj_form/fixtures')
#     def test_get_schema_content(self):
#         response = self.client.get('/widget_schemas/checklist')
#         content = json.loads(response.content)
#         self.assertIn('definitions', content.keys())
#
#     def test_get_schema_invalid_param(self):
#         response = self.client.get('/widget_schemas/nope')
#         content = json.loads(response.content)
#         self.assertEqual({}, content)


class EnaWidgetDelieverSchemasAndOptionsTest(TestCase):

    def test_simple_get_schema(self):
        response = self.client.get(
            '/brokerage/submissions/ena/form/schema/study')
        self.assertEqual(200, response.status_code)
        response = self.client.get(
            '/brokerage/submissions/ena/form/schema/non_sense')
        self.assertEqual(200, response.status_code)

    def test_simple_get_options(self):
        response = self.client.get(
            '/brokerage/submissions/ena/form/options/sample')
        self.assertEqual(200, response.status_code)
        response = self.client.get(
            '/brokerage/submissions/ena/form/options/non_sense')
        self.assertEqual(200, response.status_code)

    # TODO: move path to constant in dev_settings
    @mock.patch.object(settings, 'STATIC_ROOT',
                       'gfbio_submissions/submission_ui/fixtures')
    def test_get_options_content(self):
        response = self.client.get(
            '/brokerage/submissions/ena/form/options/sample')
        print(response)
        # content = json.loads(response.content)
        # self.assertIn('fields', content.keys())

    def test_get_options_invalid_param(self):
        response = self.client.get(
            '/brokerage/submissions/ena/form/options/nope')
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual({}, content)

    # TODO: move path to constant in dev_settings
    @mock.patch.object(settings, 'STATIC_ROOT',
                       'gfbio_submissions/submission_ui/fixtures')
    def test_get_schema_content(self):
        response = self.client.get(
            '/brokerage/submissions/ena/form/schema/study')
        content = json.loads(response.content.decode('utf-8'))
        self.assertIn('properties', content.keys())

    def test_get_schema_invalid_param(self):
        response = self.client.get(
            '/brokerage/submissions/ena/form/schema/nope')
        content = json.loads(response.content.decode('utf-8'))
        self.assertEqual({}, content)

# class TestSomeNewStuff(TestCase):
#     def test_app_config(self):
#         from django.apps import apps, AppConfig
#         app = Celery('genomicsdataservices')
#         app.config_from_object('django.conf:settings')
#         installed_apps = [app_config.name for app_config in
#                           apps.get_app_configs()]
#         self.assertTrue(True)

# class EnaWidgetDeliverJavascriptViewTest(TestCase):
#     @mock.patch.object(settings, 'STATIC_ROOT', 'genomicsdataservices/gcdj_form/fixtures')
#     def test_get(self):
#         response = self.client.get('/ena/form/js')
#         print response.status_code
#         print response.content
#         # print response.content

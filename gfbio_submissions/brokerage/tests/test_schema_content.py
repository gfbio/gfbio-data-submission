# -*- coding: utf-8 -*-
import json
import os

from django.test import TestCase


class JSONSchemaContentTest(TestCase):

    @classmethod
    def _get_static_schema_dir_path(cls):
        return '{0}{1}gfbio_submissions{1}static{1}schemas'.format(
            os.getcwd(), os.sep, )

    @classmethod
    def _get_brokerage_schema_dir_path(cls):
        return '{0}{1}gfbio_submissions{1}brokerage{1}schemas'.format(
            os.getcwd(), os.sep, )

    def test_file_names_matching(self):
        static_path = self._get_static_schema_dir_path()
        app_path = self._get_brokerage_schema_dir_path()
        self.assertListEqual(os.listdir(static_path), os.listdir(app_path))

    def test_file_content_matching(self):
        static_path = self._get_static_schema_dir_path()
        app_path = self._get_brokerage_schema_dir_path()
        for f in os.listdir(static_path):
            static_f_path = '{0}{1}{2}'.format(static_path, os.sep, f)
            app_f_path = '{0}{1}{2}'.format(app_path, os.sep, f)
            self.assertTrue(os.path.exists(app_f_path))
            self.assertTrue(os.path.exists(static_f_path))
            with open(static_f_path, 'r') as schema_a:
                with open(app_f_path, 'r') as schema_b:
                    schema_a_dict = json.load(schema_a)
                    schema_b_dict = json.load(schema_b)
                    if 'id' in schema_a_dict.keys():
                        schema_a_dict.pop('id')
                    if 'id' in schema_b_dict.keys():
                        schema_b_dict.pop('id')
                    self.assertDictEqual(schema_a_dict, schema_b_dict)

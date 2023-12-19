# -*- coding: utf-8 -*-
from django.test import TestCase


class SchemaViewTest(TestCase):
    def test_brokerage_schema_view(self):
        schemas = [
            "common_requirements_definitions.json",
            "ena_study_definitions.json",
            "ena_sample_definitions.json",
            "ena_experiment_definitions.json",
            "ena_run_definitions.json",
            "technical_content_definitions.json",
        ]
        for s in schemas:
            response = self.client.get("/generic/schema/brokerage_api/{0}".format(s))
            self.assertEqual(200, response.status_code)

    def test_api_schema_view(self):
        response = self.client.get("/generic/schema/brokerage_api/")
        self.assertEqual(200, response.status_code)

# -*- coding: utf-8 -*-

from django.test import TestCase

from gfbio_submissions.brokerage.utils.ena_cli import cli_call


class TestCLI(TestCase):

    def test_simple_calls(self):
        cli_call()

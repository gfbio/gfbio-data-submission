# -*- coding: utf-8 -*-
import os
from pprint import pprint

from django.core.management import CommandError
from django.core.management.base import BaseCommand

from gfbio_submissions.brokerage.models import BrokerObject
from gfbio_submissions.brokerage.utils.ena import parse_ena_submission_response


class Command(BaseCommand):
    help = "Adds accessions from ENA XML-Response to a submission request. "

    def add_arguments(self, parser):
        parser.add_argument("xml_file", type=str)

    def handle(self, *args, **options):
        if os.path.exists(options["xml_file"]):
            with open(options["xml_file"]) as xml_file:
                parsed = parse_ena_submission_response(xml_file.read())
                pprint(parsed)
                BrokerObject.objects.append_pids_from_ena_response(parsed)
        else:
            raise CommandError("no xml_file found here: ", options["xml_file"])

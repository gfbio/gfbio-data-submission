import json
import os
import xml.etree.ElementTree as ET
from collections import OrderedDict

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


class TestSubmissionAdmin(TestCase):

    def test_parse_xsd(self):

        platform_definition_json = OrderedDict([
            ('platform', OrderedDict([('oneOf', [])]))
        ])
        platform_instruments_json = OrderedDict()

        tree = ET.parse(
            os.path.join(
                _get_test_data_dir_path(),
                'SRA.common.xsd'
            ))
        root = tree.getroot()

        # all platform choices
        platforms = root.find(
            "*[@name='PlatformType']/{http://www.w3.org/2001/XMLSchema}choice")

        for r in platforms:
            platform_name = r.attrib.get('name', '').lower()
            platform_definition_json['platform']['oneOf'].append(
                {
                    '$ref': '#/{0}'.format(platform_name)
                }
            )

            instrument_model = r.find(
                "{http://www.w3.org/2001/XMLSchema}complexType"
                "/*/*[@name='INSTRUMENT_MODEL']").attrib.get('type', '').strip(
                'com:')

            platform_instruments_json[
                '{0}'.format(platform_name)] = OrderedDict([
                ('type', 'string'), ('enum', [])
            ])

            instrument_variations = root.findall(
                "*[@name='{0}']/*/*".format(instrument_model))

            for i in instrument_variations:
                platform_instruments_json['{0}'.format(platform_name)][
                    'enum'].append(i.attrib.get('value', ''))

        print(json.dumps(platform_definition_json))
        print('\n-----------------------------------\n')
        print(json.dumps(platform_instruments_json))

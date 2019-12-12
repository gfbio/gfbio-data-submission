import os
import xml.etree.ElementTree as ET

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


class TestSubmissionAdmin(TestCase):

    def test_parse_xsd(self):
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
            platform_name = r.attrib.get('name', '')
            instrument_model = r.find(
                "{http://www.w3.org/2001/XMLSchema}complexType"
                "/*/*[@name='INSTRUMENT_MODEL']").attrib.get('type', '').strip(
                'com:')

            print('\n------\nplatform: ', platform_name)
            print('instrument: ', instrument_model)

            instrument_variations = root.findall(
                "*[@name='{0}']/*/*".format(instrument_model))
            for i in instrument_variations:
                print(i.attrib.get('value', ''))

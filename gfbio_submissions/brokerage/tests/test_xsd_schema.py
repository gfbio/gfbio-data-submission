import os
import xml.etree.ElementTree as ET

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


class TestSubmissionAdmin(TestCase):

    def test_parse_xsd(self):
        # with open(),
        #         'r') as data_file:
        tree = ET.parse(
            os.path.join(
                _get_test_data_dir_path(),
                'SRA.common.xsd'
            ))
        root = tree.getroot()
        # print(root.tag)

        # all platform choices
        platforms = root.find(
            "*[@name='PlatformType']/{http://www.w3.org/2001/XMLSchema}choice")
        for r in platforms:
            print('\nC TAG: ', r.tag, ' | C ATTRIB: ',
                  r.attrib, ' | ', r.find('*'))

        print('\n\n')

        # for r in root.findall('*'):
        #     print('C TAG: ', r.tag, ' | C ATTRIB: ',
        #           r.attrib)

        # platform_root = None
        # for child in root:
        #     if 'PlatformType' in child.attrib.values():
        #         platform_root = child
        #         break
        #
        # for child in platform_root:
        #     print('C TAG: ', child.tag, ' | C ATTRIB: ',
        #           child.attrib.values())

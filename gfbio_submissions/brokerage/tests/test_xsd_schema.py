import os
import xml.etree.ElementTree as ET
from collections import OrderedDict
from unittest import skip

from django.test import TestCase

from gfbio_submissions.brokerage.tests.utils import _get_test_data_dir_path


@skip("prototyping to parse xsd files")
class TestSubmissionAdmin(TestCase):
    def test_parse_xsd_for_platform(self):
        platform_definition_json = OrderedDict([("platform", OrderedDict([("oneOf", [])]))])
        platform_instruments_json = OrderedDict()
        platform_mappings = {}

        tree = ET.parse(os.path.join(_get_test_data_dir_path(), "SRA.common.xsd"))
        root = tree.getroot()

        # all platform choices
        platforms = root.find("*[@name='PlatformType']/{http://www.w3.org/2001/XMLSchema}choice")

        for r in platforms:
            platform_name = r.attrib.get("name", "").lower()
            platform_definition_json["platform"]["oneOf"].append({"$ref": "#/{0}".format(platform_name)})

            instrument_model = (
                r.find("{http://www.w3.org/2001/XMLSchema}complexType" "/*/*[@name='INSTRUMENT_MODEL']")
                .attrib.get("type", "")
                .strip("com:")
            )

            platform_instruments_json["{0}".format(platform_name)] = OrderedDict([("type", "string"), ("enum", [])])

            instrument_variations = root.findall("*[@name='{0}']/*/*".format(instrument_model))

            for i in instrument_variations:
                instr = i.attrib.get("value", "")
                platform_mappings[instr.lower()] = instr
                platform_instruments_json["{0}".format(platform_name)]["enum"].append(instr)

    def test_parse_xsd_for_strategy(self):
        library_strategy_json = OrderedDict([("type", "string"), ("enum", [])])

        library_strategy_mappings = {}

        tree = ET.parse(os.path.join(_get_test_data_dir_path(), "SRA.experiment.xsd"))
        root = tree.getroot()

        library_strategy_enums = root.findall(
            "*[@name='typeLibraryStrategy']/{http://www.w3.org/2001/XMLSchema}restriction/*"
        )
        for l in library_strategy_enums:
            strategy = l.attrib.get("value", "")
            library_strategy_json["enum"].append(strategy)
            library_strategy_mappings[strategy.lower()] = strategy

    def test_parse_xsd_for_selection(self):
        library_selection_json = OrderedDict([("type", "string"), ("enum", [])])

        library_selection_mappings = {}

        tree = ET.parse(os.path.join(_get_test_data_dir_path(), "SRA.experiment.xsd"))
        root = tree.getroot()

        library_selection_enums = root.findall(
            "*[@name='typeLibrarySelection']/{http://www.w3.org/2001/XMLSchema}restriction/*"
        )
        for l in library_selection_enums:
            strategy = l.attrib.get("value", "")
            library_selection_json["enum"].append(strategy)
            library_selection_mappings[strategy.lower()] = strategy

        # library_selection_json.get('enum', []).sort()

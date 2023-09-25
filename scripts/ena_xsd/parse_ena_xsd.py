# -*- coding: utf-8 -*-

# python3

import argparse
import json
import os
import xml.etree.ElementTree as ET
from collections import OrderedDict
from pprint import pprint


def parse_for_platform(file):
    platform_definition_json = OrderedDict([("platform", OrderedDict([("oneOf", [])]))])
    platform_instruments_json = OrderedDict()
    platform_mappings = {}

    tree = ET.parse(file)
    root = tree.getroot()
    platforms = root.find(
        "*[@name='PlatformType']/{http://www.w3.org/2001/XMLSchema}choice"
    )

    for r in platforms:
        platform_name = r.attrib.get("name", "").lower()
        platform_definition_json["platform"]["oneOf"].append(
            {"$ref": "#/{0}".format(platform_name)}
        )

        instrument_model = (
            r.find(
                "{http://www.w3.org/2001/XMLSchema}complexType"
                "/*/*[@name='INSTRUMENT_MODEL']"
            )
            .attrib.get("type", "")
            .strip("com:")
        )

        platform_instruments_json["{0}".format(platform_name)] = OrderedDict(
            [("type", "string"), ("enum", [])]
        )

        instrument_variations = root.findall(
            "*[@name='{0}']/*/*".format(instrument_model)
        )

        for i in instrument_variations:
            instr = i.attrib.get("value", "")
            platform_mappings[instr.lower()] = instr
            platform_instruments_json["{0}".format(platform_name)]["enum"].append(instr)

    print("\n-----------------\tPLATFORM\t------------------\n")
    print(json.dumps(platform_definition_json, indent=4))
    print("\n-----------------------------------\n")
    print(json.dumps(platform_instruments_json, indent=4))
    print("\n-----------------------------------\n")
    pprint(platform_mappings)


def parse_for_selection(file):
    library_selection_json = OrderedDict([("type", "string"), ("enum", [])])

    library_selection_mappings = {}

    tree = ET.parse(file)
    root = tree.getroot()

    library_selection_enums = root.findall(
        "*[@name='typeLibrarySelection']/{http://www.w3.org/2001/XMLSchema}restriction/*"
    )
    for enums in library_selection_enums:
        strategy = enums.attrib.get("value", "")
        library_selection_json["enum"].append(strategy)
        library_selection_mappings[strategy.lower()] = strategy

    # library_selection_json.get('enum', []).sort()
    print("\n-----------------\tSELECTION\t------------------\n")
    print(json.dumps({"library_selection": library_selection_json}, indent=4))
    print("\n-----------------------------------\n")
    pprint(library_selection_mappings)


def parse_for_strategy(file):
    library_strategy_json = OrderedDict([("type", "string"), ("enum", [])])

    library_strategy_mappings = {}

    tree = ET.parse(file)
    root = tree.getroot()

    library_strategy_enums = root.findall(
        "*[@name='typeLibraryStrategy']/{http://www.w3.org/2001/XMLSchema}restriction/*"
    )
    for enums in library_strategy_enums:
        strategy = enums.attrib.get("value", "")
        library_strategy_json["enum"].append(strategy)
        library_strategy_mappings[strategy.lower()] = strategy

    print("\n-----------------\tSTRATEGY\t------------------\n")
    print(json.dumps({"library_strategy": library_strategy_json}, indent=4))
    print("\n-----------------------------------\n")
    pprint(library_strategy_mappings)


def parse_for_source(file):
    library_source_json = OrderedDict([("type", "string"), ("enum", [])])

    library_source_mappings = {}

    tree = ET.parse(file)
    root = tree.getroot()

    library_source_enums = root.findall(
        "*[@name='typeLibrarySource']/{http://www.w3.org/2001/XMLSchema}restriction/*"
    )
    for enums in library_source_enums:
        strategy = enums.attrib.get("value", "")
        library_source_json["enum"].append(strategy)
        library_source_mappings[strategy.lower()] = strategy

    print("\n-----------------\tSOURCE\t------------------\n")
    print(json.dumps({"library_source": library_source_json}, indent=4))
    print("\n-----------------------------------\n")
    pprint(library_source_mappings)


def output_schema_and_mappings(experiment_xsd, common_xsd):
    if not os.path.exists(experiment_xsd) or os.path.isdir(experiment_xsd):
        print("file not found or invalid: ", experiment_xsd)
        return
    if not os.path.exists(common_xsd) or os.path.isdir(common_xsd):
        print("file not found or invalid: ", experiment_xsd)
        return
    parse_for_platform(common_xsd)
    parse_for_strategy(experiment_xsd)
    parse_for_selection(experiment_xsd)
    parse_for_source(experiment_xsd)


def __main__():
    parser = argparse.ArgumentParser()
    # parser.add_argument("square", type=int,
    #                     help="display a square of a given number")
    parser.add_argument(
        "-e",
        "--experiment-xsd",
        type=str,
        help="experiment definitions xsd schema file",
    )
    parser.add_argument(
        "-c", "--common-xsd", type=str, help="common definitions xsd schema file"
    )
    args = parser.parse_args()

    output_schema_and_mappings(
        experiment_xsd=args.experiment_xsd, common_xsd=args.common_xsd
    )


__main__()

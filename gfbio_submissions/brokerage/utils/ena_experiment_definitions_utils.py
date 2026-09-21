import json
import os

def load_ena_experiment_definitions():
    path = os.path.join(
        os.getcwd(),
        "gfbio_submissions/brokerage/schemas/ena_experiment_definitions.json",
    )
    with open(path, "r") as f:
        json_dict = json.load(f)

    return json_dict


def get_library_column_validation_rules_from_ena_experiment_definitions():
    validation_rules = {}
    experiment_definitions = load_ena_experiment_definitions()

    if "library_descriptor" in experiment_definitions and "properties" in experiment_definitions["library_descriptor"]:
        for property, description in experiment_definitions["library_descriptor"]["properties"].items():
            if "enum" in description.keys() and "type" in description.keys() and description["type"] == "string":
                validation_rules[property] = {
                    "enum": description["enum"],
                    "rule": "in_enum"
                }

    return validation_rules


def find_correct_platform_and_model(platform_value):
    if platform_value == "":
        return platform_value
    # removing any leading and trailing whitespaces, make it lower case, don't rely on external methods
    platform_value_fixed = platform_value.strip()
    platform_value_fixed = platform_value_fixed.lower()

    # return empty string if value unspecified, which will otherwise be found in multiple platforms
    if platform_value_fixed == "unspecified":
        return ""

    json_dict = load_ena_experiment_definitions()

    # save all matched platform when fixed value is treated as an instrument
    matched_platforms_value_as_instrument = []
    # save all matched platform when fixed value is treated as a platform
    matched_platforms_value_as_platform = []
    # when first word in platform value could be a platform name or part of it
    # examples:
    # pacbio should match pacbio_smrt unspecified
    # pacbio Sequel should match pacbio_smrt Sequel
    # illum should match illumina unspecified
    partial_platform_match = []
    # try to connect all words together to find a platform or instrument
    # stores {} format platform:instrument
    combined_vlaue_match = []
    combined_platform_value = "_".join(platform_value_fixed.split())

    for platform in json_dict:
        # identify viable platforms in json file
        if (
            len(json_dict[platform]) == 2
            and "enum" in json_dict[platform].keys()
            and "type" in json_dict[platform].keys()
            and json_dict[platform]["type"] == "string"
        ):
            instruments = json_dict[platform]["enum"]

            # match value as instrument
            for instrument in instruments:
                if platform_value_fixed == instrument.lower():
                    matched_platforms_value_as_instrument.append({platform: instrument})
                # combined value as instrument check
                if combined_platform_value == instrument.lower():
                    combined_vlaue_match.append({platform: instrument})

            # match value as platform
            if platform_value_fixed == platform.lower():
                matched_platforms_value_as_platform.append(platform)

            # partial match
            partial_instrument = (
                "unspecified" if len(platform_value_fixed.split()) == 1 else platform_value_fixed.split()[1:]
            )
            if partial_instrument != "unspecified":
                partial_instrument = " ".join(partial_instrument)
                partial_instrument = partial_instrument.lower()
            if platform_value_fixed.split()[0] in platform.lower():
                partial_platform_match.append({platform: ""})
                for instrument in instruments:
                    if partial_instrument == instrument.lower():
                        partial_platform_match[len(partial_platform_match) - 1][platform] = instrument

            # combined value match
            if combined_platform_value == platform.lower():
                combined_vlaue_match.append({platform: "unspecified"})

    if len(matched_platforms_value_as_instrument) == 1:
        platform_key = list(matched_platforms_value_as_instrument[0].keys())[0]
        return platform_key + " " + matched_platforms_value_as_instrument[0][platform_key]
    elif len(matched_platforms_value_as_platform) == 1:
        # check if unspecified value is allowed
        if "unspecified" in json_dict[matched_platforms_value_as_platform[0]]["enum"]:
            return matched_platforms_value_as_platform[0] + " unspecified"
        else:
            return ""
    elif len(combined_vlaue_match) == 1:
        platform_key = list(combined_vlaue_match[0].keys())[0]
        # check if unspecified value is allowed
        if combined_vlaue_match[0][platform_key] == "unspecified" and "unspecified" in json_dict[platform_key]["enum"]:
            return platform_key + " unspecified"
        else:
            return platform_key + " " + combined_vlaue_match[0][platform_key]
    elif len(partial_platform_match) == 1:
        platform_key = list(partial_platform_match[0].keys())[0]
        if partial_platform_match[0][platform_key] == "":
            return ""
        else:
            return platform_key + " " + partial_platform_match[0][platform_key]
    else:
        # unidentifiable value
        return ""
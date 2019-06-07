# -*- coding: utf-8 -*-
import collections
import copy
import csv
import json
from decimal import Decimal, InvalidOperation

import dpath
from jsonschema import Draft4Validator

from gfbio_submissions.brokerage.configuration.settings import BASIC_TYPE, \
    SEPARATOR, CSV_READER_QUOTING, \
    DRAFT04_VALIDATORS


def is_enum(s):
    return len(s) > 2 and s[0] == '[' and s[-1] == ']'


def get_enum_syntax(s):
    return {'enum': str(s).strip('[]').split('|')}


def is_content_known_field(list_of_fields, fields=[]):
    s = set([x in fields for x in list_of_fields])
    return len(s) == 1 and s.pop()


def get_type_with_title(title='', type=BASIC_TYPE):
    t = copy.copy(type)
    res = t
    if 'properties' in type.keys():
        for k in type['properties'].keys():
            type['properties'][k]['title'] = k
    res['title'] = title
    return res


# TODO: deal with subproperties, e.g. method above
def get_type_with_properties(properties_to_add={}, json_type=BASIC_TYPE,
                             omit_type=False):
    t = copy.copy(json_type)
    res = t
    if omit_type:
        res = {}
    for k in properties_to_add.keys():
        res[k] = properties_to_add[k]
    return res


def clean_key(key):
    return key.replace('(', '').replace(')', '').replace(' ', '_').replace('/',
                                                                           '_').lower()


def get_json_template(schema_dict):
    res = {}
    for k in schema_dict['properties'].keys():
        if 'properties' in schema_dict['properties'][k].keys():
            res[k] = {pk: '*' for pk in
                      schema_dict['properties'][k]['properties'].keys()}
        else:
            res[k] = '*'

    return res


def validate_gcdjson(schema, json_data):
    s = json.loads(schema.schema.replace('\'', '"'))
    validator = Draft4Validator(s)
    # TODO: add key for form access to constants --> gcdjson
    return [
        'Field \'{0}\' contains errors: {1}'.format(
            error.relative_path.pop(),
            error.message.replace('u\'', '\'')
        )
        if len(error.relative_path) > 0
        else '{0}'.format(error.message.replace('u\'', '\''))
        for error in validator.iter_errors(json_data.get('gcdjson', ''))
    ]


def add_to_properties(props):
    for sub_prop in props:
        props[sub_prop]['required'] = True
        props[sub_prop]['title'] = sub_prop


def add_widget_sub_properties(package_properties):
    for k in package_properties.get('properties', {}):
        if package_properties['properties'][k].has_key('properties'):
            add_to_properties(package_properties['properties'][k]['properties'])
    return package_properties


def flatten_key_with_array_value(key, array_value, separator='_'):
    return [
        ('{0}{1}{2}'.format(key, separator, i), array_value[i])
        for i in range(0, len(array_value))
    ]


# TODO: used by pangaea utils to add gcdj information to samples
def flatten_dictionary(dictionary, parent_key='', separator='_'):
    items = []
    for k, v in dictionary.iteritems():
        new_key = parent_key + separator + k if parent_key else k
        if isinstance(v, collections.MutableMapping):
            items.extend(
                flatten_dictionary(v, new_key, separator=separator).items())
        else:
            items.append((new_key, v)) if not isinstance(v, list) \
                else items.extend(
                flatten_key_with_array_value(new_key, v, separator))
    return collections.OrderedDict(items)


def extract_number_types(value):
    if '"' in value:
        value = value.strip('"')
    if value.isdigit():
        return int(value)
    elif value == 'true':
        return True
    elif value == 'false':
        return False
    else:
        try:
            d = Decimal(value)
            # assuming float after checking for int,
            # complex type etc not covered here ...
            return float(value)
        except InvalidOperation:
            return value


def convert_csv(input_buffer):
    reader = csv.reader(input_buffer, delimiter=',', quotechar='"',
                        quoting=CSV_READER_QUOTING
                        )
    try:
        field_names = reader.next()
        values = reader.next()
    except csv.Error as e:
        input_buffer.close()
        return {'Error': e.message}
    except ValueError as e:
        input_buffer.close()
        return {'Error': e.message}
    except StopIteration as e:
        return {
            'Error': 'two lines are needed, one containing fieldnames, another containing values'}
    else:
        input_buffer.close()
        if len(field_names) != len(values):
            return {
                'Error': 'number of fieldnames does not match number of values'}
        field_names = [extract_number_types(f) for f in field_names]
        values = [True if v == 'true' or v == 'True' else v for v in values]
        values = [extract_number_types(v) for v in values]

        result = {}
        array_props = []
        for i in range(0, len(field_names)):
            splitted_field_names = field_names[i].split(SEPARATOR)
            if splitted_field_names[-1].isdigit():
                array_props.append((
                    field_names[i].rstrip(splitted_field_names[-1]), values[i]))
            else:
                dpath.util.new(result, field_names[i], value=values[i],
                               separator=SEPARATOR)
        d = collections.defaultdict(list)
        for k, v in array_props:
            d[k.rstrip(SEPARATOR)].append(v)
        for k in d:
            dpath.util.new(result, k, d[k], separator=SEPARATOR)
        return result


def find_values_for_key(obj, key, result=[]):
    if key in obj:
        result.append(obj[key])
    for k, v in obj.items():
        if isinstance(v, dict):
            find_values_for_key(v, key, result)
        elif isinstance(v, list):
            for l in v:
                if isinstance(l, dict):
                    find_values_for_key(l, key, result)


def connect_schema_with_data(definitions, schema):
    schema['definitions'] = definitions.get('definitions', {})
    definition_includes = {
        'incl_{}'.format(d): {
            '$ref': '#/definitions/{0}'.format(d)
        } for d in definitions.get('definitions', {})
    }
    schema['properties'].update(definition_includes)
    data = {
        'incl_{}'.format(d): 1
        for d in definitions.get('definitions', {})
    }
    return data


def get_schema_check_warnings(schema, definitions):
    schema_warnings = {
        prop: [
            '"{0}" is no json-schema attribute'.format(c)
            for c in content.keys() if c not in DRAFT04_VALIDATORS
        ] for prop, content in schema.get('properties').iteritems() if
        isinstance(content, dict)
    }
    definition_warnings = {
        d: [
            '"{0}" is no json-schema attribute'.format(c)
            for c in content.keys() if c not in DRAFT04_VALIDATORS
        ] for d, content in definitions.get('definitions').iteritems()
    }
    return definition_warnings, schema_warnings


def copy_objects(objects, new_version):
    for obj in objects:
        obj.pk = None
        obj.version = new_version
        obj.save()

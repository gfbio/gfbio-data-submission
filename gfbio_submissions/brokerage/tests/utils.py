# -*- coding: utf-8 -*-
import json
import os


def _get_test_data_dir_path():
    return '{0}{1}gfbio_submissions{1}brokerage{1}tests{1}test_data'.format(
        os.getcwd(), os.sep, )


def _get_ena_data(simple=False):
    if simple:
        with open(os.path.join(
                _get_test_data_dir_path(), 'ena_data.json'), 'r') as data_file:
            return json.load(data_file)

    with open(os.path.join(
            _get_test_data_dir_path(),
            'ena_data_runs.json'), 'r') as data_file:
        return json.load(data_file)


def _get_ena_data_without_runs():
    with open(os.path.join(
            _get_test_data_dir_path(),
            'ena_data_no_runs.json'), 'r') as data_file:
        return json.load(data_file)


# def _get_ena_data_with_runs():
#     with open(os.path.join(
#             _get_test_data_dir_path(),
#             'ena_data_no_runs.json'), 'r') as data_file:
#         return json.load(data_file)


def _get_parsed_ena_response():
    with open(os.path.join(
            _get_test_data_dir_path(), 'ena_response.json'), 'r') as data_file:
        return json.load(data_file)

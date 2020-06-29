# -*- coding: utf-8 -*-
import csv
import os
from pprint import pprint

from django.conf import settings
import subprocess


# FIXME: Prototype
# TODO: exceptions, logging, protocoll for curator
# TODO: move to task/celeryworkers
def cli_call():
    print('cli_call')
    res = subprocess.run(['ls', '-l'], capture_output=True, check=True)
    print('\n', res)

    try:
        res = subprocess.run(['java', '--version'], capture_output=True,
                             check=True)
        print('\n', res)
    except subprocess.CalledProcessError as e:
        print('error ', e)
    except FileNotFoundError as e:
        print('fnferror ', e)
    try:
        res = subprocess.run(
            ['java', '-jar', 'ena_webin_cli/webin-cli-3.0.0.jar'],
            capture_output=True,
            check=False)
        print('\n', res)
    except subprocess.CalledProcessError as e:
        print('error ', e)
    except FileNotFoundError as e:
        print('fnferror ', e)


def submit_targeted_sequences(
        username,
        password,
        submission,
        center_name='GFBIO'):
    print('submit_targeted_sequences')

    study_bo = submission.brokerobject_set.filter(type='study').first()
    study_pid = study_bo.persistentidentifier_set.filter(
        archive='ENA').filter(pid_type='PRJ').first()
    upload = submission.submissionupload_set.filter(
        file__endswith='.tsv.gz').first()

    submission_folder = os.path.join(settings.MEDIA_ROOT,
                                     str(submission.broker_submission_id))
    print(os.path.exists(submission_folder))

    tab_file_path = os.path.join(settings.MEDIA_ROOT, upload.file.name)
    print(os.path.exists(tab_file_path))

    manifest_path = os.path.join(submission_folder, 'MANIFEST')
    print(os.path.exists(manifest_path))

    with open(manifest_path, 'w') as output:
        writer = csv.writer(output, delimiter=str('\t'))
        writer.writerow(('STUDY', study_pid.pid))
        writer.writerow(('NAME', '{}:{}'.format(study_bo.pk,
                                                submission.broker_submission_id)))
        writer.writerow(('TAB', tab_file_path))
        writer.writerow(('AUTHORS', 'Weber M., Kostadinov I.;'))
        writer.writerow(('ADDRESS',
                         'University of Bremen, Leobener Str. 5, 28359 Bremen, Germany'))

    try:
        res = subprocess.run(
            [
                'java', '-jar', 'ena_webin_cli/webin-cli-3.0.0.jar',
                '-context', 'sequence',
                '-username', username,
                '-password', password,
                '-centername', center_name,
                # TODO: test for testing ...
                '-test',
                '-validate',
                '-manifest', manifest_path,
                '-inputDir', submission_folder,
                '-outputDir', submission_folder
            ],
            capture_output=True,
            check=False)

        print('\n--------------- webcli output -------------')
        print('type output ', type(res))
        print('\n', res)
        print('---------------------------------------')
        print(os.listdir(submission_folder))
        with open(os.path.join(submission_folder, 'MANIFEST.report'), 'r') as report:
            pprint(report.readlines())

    except subprocess.CalledProcessError as e:
        print('error ', e)
    except FileNotFoundError as e:
        print('fnferror ', e)

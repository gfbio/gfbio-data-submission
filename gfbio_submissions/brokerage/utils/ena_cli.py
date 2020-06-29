# -*- coding: utf-8 -*-
import os

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
        manifest_file,
        submission,
        center_name='GFBIO'):
    print('submit_targeted_sequences')

    # try:
    #     res = subprocess.run(['ls',
    #                           '{}{}{}'.format(settings.MEDIA_ROOT, os.sep,
    #                                           broker_submission_id)],
    #                          capture_output=True, check=True)
    #     print('\n', res)
    # except subprocess.CalledProcessError as e:
    #     print('error ', e)
    # except FileNotFoundError as e:
    #     print('fnferror ', e)
    submission_folder = os.path.join(settings.MEDIA_ROOT,
                                     str(submission.broker_submission_id))

    print(os.path.exists(submission_folder))
    print(os.listdir(submission_folder))
    upload = submission.submissionupload_set.filter(
        file__endswith='.tsv.gz').first()
    # file_path = '{}{}{}'.format(settings.MEDIA_ROOT, os.sep,
    #                             submission_folder + os.sep + upload.file.name)
    file_path = os.path.join(settings.MEDIA_ROOT, upload.file.name)
    # pprint(upload.__dict__)
    # path, filename = os.path.split(upload.file.name)
    print(file_path)
    print(os.path.exists(file_path))

    # try:
    #     res = subprocess.run(
    #         [
    #             'java', '-jar', 'ena_webin_cli/webin-cli-3.0.0.jar',
    #             '-context', 'sequence',
    #             '-username', username,
    #             '-password', password,
    #             '-centername', center_name,
    #             '-manifest', manifest_file,
    #             '-input', '{}{}{}'.format(settings.MEDIA_ROOT, os.sep, broker_submission_id)
    #         ],
    #         capture_output=True,
    #         check=False)
    #     print('\n', res)
    # except subprocess.CalledProcessError as e:
    #     print('error ', e)
    # except FileNotFoundError as e:
    #     print('fnferror ', e)

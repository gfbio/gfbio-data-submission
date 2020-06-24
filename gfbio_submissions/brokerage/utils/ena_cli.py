# -*- coding: utf-8 -*-

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

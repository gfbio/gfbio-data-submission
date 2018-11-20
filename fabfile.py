# -*- coding: utf-8 -*-
import os
import re
import time
from datetime import datetime
from shutil import move
from tempfile import mkstemp

from fabric.api import env, local, task, run, cd
from fabric.context_managers import hide

env.hosts = ['141.5.106.43', ]
env.user = 'cloud'


def replace_version_number(file_path, version_number):
    # Create temp file
    fh, abs_path = mkstemp()
    with os.fdopen(fh, 'w') as new_file:
        with open(file_path) as old_file:
            for line in old_file:
                if line.count('VERSION = '):
                    new_file.write('VERSION = \'{}\'\n'.format(version_number))
                else:
                    new_file.write(line)
    # Remove original file
    os.remove(file_path)
    # Move new file
    move(abs_path, file_path)


@task(hide=True)
def start_release(version_number):
    local('git checkout develop')
    local('git flow release start {0}'.format(version_number))


@task(hide=True)
def encrypt_env():
    local('gpg -vco encrypted.env.gpg .env')


@task(hide=True)
def commit_changes(version_number):
    local(
        'git commit -am "release/{} bump version and update encrypted .env"'.format(
            version_number))


@task(hide=True)
def finish_release(version_number):
    # To prevent annoying editor pop-ups during release try:
    # export GIT_MERGE_AUTOEDIT=no
    # unset with:
    # unset GIT_MERGE_AUTOEDIT
    local('git flow release finish {0} -m "release/{0} finish release" -T {0}'.format(version_number))

@task(hide=True)
def push_to_origin():
    local('git push origin master develop --tags')


@task
def local_release(version_number):
    print '\n-----------\tStart local release\t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    start_release(version_number=version_number)

    path = '{0}{1}{2}'.format(os.getcwd(), os.sep,
                              'config/settings/base.py')
    print '\n-----------\tReplace Version\t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    if os.path.exists(path):
        replace_version_number(file_path=path,
                               version_number=version_number)
    else:
        print 'Failed replacing version number ', version_number
        return

    print '\n-----------\tEncrypt .env \t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    encrypt_env()
    print '\n-----------\tCommit changes\t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    commit_changes(version_number=version_number)
    print '\n-----------\tFinish release\t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    finish_release(version_number=version_number)
    print '\n-----------\tPush to origin and add tags\t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    push_to_origin()


@task(hide=True)
def is_service_running():
    output = run('sudo supervisorctl status')
    return output.count('gfbio_submissions                RUNNING') == 1


@task(hide=True)
def show_docker_compose_status():
    run('sudo docker-compose -f production.yml ps')


@task(hide=True)
def stop_service():
    run('sudo supervisorctl stop gfbio_submissions')


@task(hide=True)
def start_service():
    run('sudo supervisorctl start gfbio_submissions')


@task
def fetch_changes():
    run('sudo git fetch')


@task(hide=True)
def checkout_release(version_number):
    run('sudo git checkout {0}'.format(version_number))


@task(hide=True)
def decrypt_env():
    run('sudo gpg -o .env encrypted.env.gpg')


@task(hide=True)
def build_containers():
    run('sudo docker-compose -f production.yml build')


@task(hide=True)
def apply_migrations():
    with hide('output'):
        run(
            'sudo docker-compose -f production.yml run --rm django python manage.py migrate')


@task(hide=True)
def copy_static_files():
    run('sudo docker-compose -f production.yml run --rm django python manage.py collectstatic')


@task(hide=True)
def create_db_backup():
    run('sudo docker-compose -f production.yml run --rm postgres backup')


@task(hide=True)
def delete_tag(version_number):
    local('git tag -d {}'.format(version_number))
    local('git push origin :refs/tags/{}'.format(version_number))


@task
def deploy_to_server(version_number):
    print '\n-----------\tDeploy to Server\t{}\t-----------\n'.format(
        datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    if not is_service_running():
        print '\n\tgfbio_submissions process not running. aborting now and remove tag {}.\n'.format(version_number)
        delete_tag(version_number=version_number)
        return
    code_dir = '/var/www/gfbio_submissions'
    with cd(code_dir):
        print '\n-----------\tShow service status\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        show_docker_compose_status()
        print '\n-----------\tCreate database backup\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        create_db_backup()
        print '\n-----------\tStop service\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        print '\nStopping service. waiting 30 seconds for containters to go down\n'
        stop_service()
        time.sleep(30)
        print '\n-----------\tFetch changes\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        fetch_changes()
        print '\n-----------\tCheckout release\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        checkout_release(version_number=version_number)
        print '\n-----------\tDecrypt .env\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        decrypt_env()
        print '\n-----------\tBuild Containers\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        build_containers()
        print '\n-----------\tApply Migrationst{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        apply_migrations()
        print '\n-----------\tCopy static files\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        copy_static_files()
        print '\n-----------\tStart Service\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        start_service()
        print '\n\tStaring service. waiting 60 seconds for containters run\n'
        time.sleep(60)
        print '\n-----------\tDone. Show service status\t{}\t-----------\n'.format(
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
        show_docker_compose_status()


@task(default=True)
def release(version_number='Enter a valid version number'):
    start = time.time()
    prog = re.compile(r"^\d+\.\d+\.\d+$")
    res = prog.match(version_number)
    if res is None:
        print '\n\tVersion no matching pattern. -> ', version_number
        print '\ttry fab release:INT.INT.INT . for example:'
        print '\tfab release:0.1.0 or fab release:1.23.9'
        return
    else:
        local_release(version_number=version_number)
        deploy_to_server(version_number=version_number)
        end = time.time()
        elapsed_time = end - start
        print '\n\nRelease finished in: {}\n'.format(
            time.strftime("%H:%M:%S", time.gmtime(elapsed_time)))

# TODO: hide other tasks, only local_release, deploy_to_server and global task should be visible
# TODO: add revert task(s) that go back to previous tag, build, restore db from backup and bring service up again

# TODO: yes on dialogs
# TODO: prevent merge editor popping up
# TODO: enter gpg password ?

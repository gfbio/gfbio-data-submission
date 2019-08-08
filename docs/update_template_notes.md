# Update cookie-cutter template and libraries

## Setup 

- workon gfbio_submissions_release
- pip install "cookiecutter>=1.4.0"
- cookiecutter https://github.com/pydanny/cookiecutter-django

        You've downloaded /home/maweber/.cookiecutters/cookiecutter-django before. Is it okay to delete and re-download it? [yes]: 
        project_name [My Awesome Project]: GFBio Submissions
        project_slug [gfbio_submissions]: 
        description [Behold My Awesome Project!]: Submission services provided by GFBio
        author_name [Daniel Roy Greenfeld]: Marc Weber 
        domain_name [example.com]: submissions.gfbio.org
        email [marc-weber@example.com]: maweber@mpi-bremen.de
        version [0.1.0]: 1.75.0
        Select open_source_license:
        1 - MIT
        2 - BSD
        3 - GPLv3
        4 - Apache Software License 2.0
        5 - Not open source
        Choose from 1, 2, 3, 4, 5 (1, 2, 3, 4, 5) [1]: 
        timezone [UTC]: 
        windows [n]: 
        use_pycharm [n]: y
        use_docker [n]: y
        Select postgresql_version:
        1 - 11.3
        2 - 10.8
        3 - 9.6
        4 - 9.5
        5 - 9.4
        Choose from 1, 2, 3, 4, 5 (1, 2, 3, 4, 5) [1]: 
        Select js_task_runner:
        1 - None
        2 - Gulp
        Choose from 1, 2 (1, 2) [1]: 
        Select cloud_provider:
        1 - AWS
        2 - GCP
        3 - None
        Choose from 1, 2, 3 (1, 2, 3) [1]: 3
        custom_bootstrap_compilation [n]: 
        use_compressor [n]: 
        use_celery [n]: y
        use_mailhog [n]: 
        use_sentry [n]: y
        use_whitenoise [n]: y
        use_heroku [n]: 
        use_travisci [n]: 
        keep_local_envs_in_vcs [y]: 
        debug [n]: 
         [WARNING]: You chose not to use a cloud provider, media files won't be served in production.
         [SUCCESS]: Project initialized, keep up the good work!

### local

following https://cookiecutter-django.readthedocs.io/en/latest/developing-locally-docker.html

- docker-compose -f local.yml build --no-cache . no cache because of old containers of same project
- docker-compose -f local.yml up . for initial pulling of images
- docker-compose -f local.yml run --rm django python manage.py createsuperuser

        Starting gfbio_submissions_postgres_1_e2637638ff96 ... done
        PostgreSQL is available
        Username: maweber
        Email address: maweber@mpi-bremen.de
        Password: -> test1234
        Password (again): 
        This password is too common.
        Bypass password validation and create user anyway? [y/N]: y
        Superuser created successfully.

- intital run for images
- docker-compose -f local.yml run --rm django python manage.py createsuperuser
- add & update requirements for brokerage app
- add & adapt settings (base & production)
- copy static files
- copy templates

- copy submission_ui app (not registered under APPS ...)

## Initial deploy on dev server for testing

### update machine

- apt-get update
- apt-get upgrade

- restart via gwdg web-interface

### backup database

- git branch -> currently on develop
- docker-compose -f production.yml run --rm postgres backu
- docker ps to get psotgres container id
- docker cp 9059e90210e8:/backups/backup_2019_08_08T12_10_47.sql.gz /var/www/gfbio_submissions/

### pull feature branch

- supervisorctl stop devgfbiosubmissions
- docker-compose -f production.yml down
- git fetch
- git stash (because of renamed dev server caddyfile)
- git checkout feature/GFBIO-2448-major-update

### prepare & build

- first: manual scp of env directory: 

        maweber@makrele:~/devel/gfbio_submissions$ scp -r .envs/ root@141.5.103.171:/var/www/gfbio_submissions/

- docker-compose -f production.yml build --no-cache
- docker-compose -f production.yml up . for initial pulling/building of images

#### copy .envs for development server

- cp .envs to .envs-development and adapt values to dev-server.env values
- scp to development server:

        scp -r .envs-development/ root@141.5.103.171:/var/www/gfbio_submissions/

- on develoment server mv current settings to other name and move development settings to replace them:

        mv .envs .envs-production
        mv .envs-development/ .envs

#### continue set up

- docker-compose -f production.yml build --no-cache
- set traefik.toml for domain c103-171.cloud.gwdg.de

## Libraries to inspect

- https://github.com/core-api/python-client
- https://github.com/core-api/core-api/


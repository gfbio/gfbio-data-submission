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

## Libraries to inspect

- https://github.com/core-api/python-client
- https://github.com/core-api/core-api/
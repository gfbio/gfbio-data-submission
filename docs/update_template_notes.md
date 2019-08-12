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

## Protocol of initial deploy on dev server for testing

### update machine

- apt-get update
- apt-get upgrade

- restart via gwdg web-interface

### backup database (IMPORTANT !!!)

- git branch -> currently on develop
- docker-compose -f production.yml run --rm postgres backup
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

(- docker-compose -f production.yml build --no-cache)
- set traefik.toml for domain c103-171.cloud.gwdg.de
- docker-compose -f production.yml build

- add git deps to production docker file
- add images to static dir and push/pull via git
- fix white noise error with image file:
  
        chmod 755 gfbio_logo.dark.svg

- rebuild: docker-compose -f production.yml build
- docker-compose -f production.yml run --rm django python manage.py collectstatic
- docker-compose -f production.yml up

- add vendors and push/pull via git
- rebuild: docker-compose -f production.yml build
- docker-compose -f production.yml run --rm django python manage.py collectstatic
- docker-compose -f production.yml up

--------------------------------------------------------------------------------

#### no database content

- git pull origin feature/GFBIO-2448-major-update 
- docker-compose -f production.yml build
- run for show etc.: docker-compose -f production.yml up

- apply migrations to new database. works. all applied. no errors
- import dump:
- docker-compose -f production.yml exec postgres restore backup_2019_08_08T12_10_47.sql.gz
    - state of applied migration as in database dump
- docker-compose -f production.yml run --rm django python manage.py migrate
    - apply mirations missing in dump db. working. all (including borkerage) applied except users
    - fail on users 0002...
    
            File "/usr/local/lib/python3.6/site-packages/django/db/backends/utils.py", line 84, in _execute
                return self.cursor.execute(sql, params)
            psycopg2.errors.DuplicateColumn: column "is_site" of relation "users_user" already exists

-  docker-compose -f production.yml run --rm django python manage.py migrate users 0002_auto_20190802_1246 --fake
    - also user is applied according to showmigrations

- some commands:

         docker-compose -f local.yml run --rm django python manage.py makemigrations
         docker-compose -f local.yml run --rm django python manage.py migrate
         docker-compose -f local.yml run --rm django python manage.py showmigrations
         docker-compose -f local.yml run --rm django python manage.py migrate --fake users zero
         docker-compose -f local.yml run --rm django python manage.py migrate users --fake-initial
         docker-compose -f local.yml run --rm django python manage.py showmigrations

--------------------------------------------------------------------------------
 
### media files & uploaded data

- docker exec -it gfbio_submissions_django_1_f08faa3561e2 sh
- for root: docker exec -u 0 -it gfbio_submissions_django_1_f08faa3561e2 sh
- after initial build vlume still available, data is there
- /app/gfbio_submissions $ ls -l
        
        (...)
        drwxr-xr-x   23 999      root          4096 Jul  7 23:00 media
        (...)
       
- cd gfbio_submissions/
- chown -R django media/
- chgrp -R root media/

- build again for testing permissions ...
- permissions ok
- changeing submisisonUpload file in admin works

- --> BACKUP media on production

- consider cleaning via prune. make sure main system running to keep needed stuff used
- docker volume prune
- docker image prune (take some time, seems to free a lot of space)

--------------------------------------------------------------------------------
       
- check supervisor configuration in /etc/supervisor/conf.d (still working)

--------------------------------------------------------------------------------

- flower ? added port 5555 tcp & udp in gwdg sec. group default rules

--------------------------------------------------------------------------------

## Protocol of first deploy on production server

- ssh -l cloud 141.5.106.43

### clean production server

- docker volume prune
- docker image prune

### backup file uploads

- sudo mkdir media_backup
- sudo docker cp df5e5092995c:/app/gfbio_submissions/media/ media_backup/

### backup older react app

- on server: cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions/static$ cp -r ui/ /var/www/
- local: maweber@makrele:~/devel/gfbio_submissions/backup_tmp$ scp -r cloud@141.5.106.43:/var/www/ui .

### backup production database

- docker-compose -f production.yml run --rm postgres backup

        creating backup
        ---------------
        successfully created backup backup_2019_08_09T20_13_32.sql.gz
        
- docker ps

        CONTAINER ID        IMAGE                            COMMAND                  CREATED             STATUS              PORTS                                                NAMES
        5bf287ee6825        gfbio_submissions_caddy          "/usr/bin/caddy --co…"   4 weeks ago         Up 4 weeks          0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 2015/tcp   gfbio_submissions_caddy_1_948a033875ef
        df5e5092995c        gfbio_submissions_django         "/entrypoint.sh /gun…"   4 weeks ago         Up 4 weeks                                                               gfbio_submissions_django_1_8fc8e8f6cadd
        4f2150f71c3e        gfbio_submissions_celeryworker   "/entrypoint.sh /sta…"   4 weeks ago         Up 4 weeks                                                               gfbio_submissions_celeryworker_1_c75cffd37edb
        10b2578aff2a        gfbio_submissions_postgres       "docker-entrypoint.s…"   6 weeks ago         Up 6 weeks          5432/tcp                                             gfbio_submissions_postgres_1_d12a9d4cf59f
        21ee1fb84eac        redis:3.0                        "docker-entrypoint.s…"   6 weeks ago         Up 6 weeks          6379/tcp                                             gfbio_submissions_redis_1_f9158e72adeb

- sudo docker cp 10b2578aff2a:/backups/backup_2019_08_09T20_13_32.sql.gz .
- ls
    
        (... ) backup_2019_08_09T20_13_32.sql.gz  (...) backups
                  
- scp -r cloud@141.5.106.43:/var/www/gfbio_submissions/backup_20* .

### update system

- sudo supervisorctl stop gfbio_submissions
- sudo apt update && sudo apt upgrade
- restart via gwdg web-interface

### update 

- sudo supervisorctl stop gfbio_submissions
- docker-compose -f production.yml down

## Libraries to inspect

- https://github.com/core-api/python-client
- https://github.com/core-api/core-api/

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
- - docker-compose -f production.yml up

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

         docker-compose -f production.yml run --rm django python manage.py makemigrations
         docker-compose -f production.yml run --rm django python manage.py migrate
         docker-compose -f production.yml run --rm django python manage.py showmigrations
         docker-compose -f production.yml run --rm django python manage.py migrate --fake users zero
         docker-compose -f production.yml run --rm django python manage.py migrate users --fake-initial
         docker-compose -f production.yml run --rm django python manage.py showmigrations

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

## Standard deployment/release procedure for developement server (work in progress ...)

- ssh -l root 141.5.103.171
- cd /var/www/gfbio_submissions/
- supervisorctl stop devgfbiosubmissions
- git fetch
- (git checkout <BRANCH>)
- git pull origin develop (or feature branch)

- RENAME compose/production/devserver-taefik.toml to taefik.toml (because of different domain)

        mv compose/production/traefik/traefik.toml compose/production/traefik/prod-traefik.toml && mv compose/production/traefik/devserver-traefik.toml compose/production/traefik/traefik.toml


- docker-compose -f production.yml build
- docker-compose -f production.yml run --rm django python manage.py migrate
- docker-compose -f production.yml run --rm django python manage.py collectstatic
- docker-compose -f production.yml up OR supervisorctl start devgfbiosubmissions


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

### update app

- git flow release start 1.75.0
- git flow release finish 1.75.0
- git push origin develop master --tags

- sudo supervisorctl stop gfbio_submissions
- docker-compose -f production.yml down

- sudo git fetch
- git branch 
- git checkout develop 
- sudo git checkout develop 
- sudo git pull origin develop 

- rsync -av .envs/ cloud@141.5.106.43:/home/cloud/ 
- cloud@mastodon:~$ pwd

        /home/cloud
        
- sudo cp -r .envs/ /var/www/gfbio_submissions/

- sudo git checkout 1.75.0
- git branch 

        * (HEAD detached at 1.75.0)

- sudo docker-compose -f production.yml build --no-cache
- for inital pulling of images etc.: docker-compose -f production.yml up

#### fix traefik.toml

- git checkout develop
- sudo git fetch
- sudo git pull origin develop
- time sudo docker-compose -f production.yml build

        real	64m41,782s
        user	3m48,316s
        sys	9m5,209s

- docker-compose -f production.yml up
- fix error in treafik.toml, push/pull again
- check content of traefik.tom on server
- time sudo docker-compose -f production.yml build

        real	68m29,781s
        user	3m54,390s
        sys	9m7,672s
        
- docker-compose -f production.yml up

--------------------------------------------------------------------------------

- docker-compose -f production.yml run --rm django python manage.py collectstatic

### setup database & import dump

- time docker-compose -f production.yml run --rm django python manage.py migrate
- docker-compose -f production.yml run --rm django python manage.py showmigrations

- sudo docker cp backup_2019_08_12T12_29_07.sql.gz 3ec75df28b13:/backups

- docker-compose -f production.yml exec postgres restore backup_2019_08_12T12_29_07.sql.gz

        SUCCESS: The 'gfbio_submissions' database has been restored from the '/backups/backup_2019_08_12T12_29_07.sql.gz' backup.
        
- docker-compose -f production.yml run --rm django python manage.py migrate

        (...)
          Apply all migrations: account, admin, auth, authtoken, brokerage, contenttypes, django_celery_beat, sessions, sites, socialaccount, users
        Running migrations:
          Applying admin.0003_logentry_add_action_flag_choices... OK
          Applying auth.0009_alter_user_last_name_max_length... OK
          Applying auth.0010_alter_group_name_max_length... OK
          Applying auth.0011_update_proxy_permissions... OK
          Applying django_celery_beat.0001_initial... OK
          Applying django_celery_beat.0002_auto_20161118_0346... OK
          Applying django_celery_beat.0003_auto_20161209_0049... OK
          Applying django_celery_beat.0004_auto_20170221_0000... OK
          Applying django_celery_beat.0005_add_solarschedule_events_choices... OK
          Applying django_celery_beat.0006_auto_20180322_0932... OK
          Applying django_celery_beat.0007_auto_20180521_0826... OK
          Applying django_celery_beat.0008_auto_20180914_1922... OK
          Applying django_celery_beat.0006_auto_20180210_1226... OK
          Applying django_celery_beat.0006_periodictask_priority... OK
          Applying django_celery_beat.0009_periodictask_headers... OK
          Applying django_celery_beat.0010_auto_20190429_0326... OK
          Applying django_celery_beat.0011_auto_20190508_0153... OK
          Applying users.0002_auto_20190802_1246...Traceback (most recent call last):
          File "/usr/local/lib/python3.6/site-packages/django/db/backends/utils.py", line 84, in _execute
            return self.cursor.execute(sql, params)
        psycopg2.errors.DuplicateColumn: column "is_site" of relation "users_user" already exists
        (...)
        django.db.utils.ProgrammingError: column "is_site" of relation "users_user" already exists

- docker-compose -f production.yml run --rm django python manage.py migrate users 0002_auto_20190802_1246 --fake
- docker-compose -f production.yml run --rm django python manage.py showmigrations

        (...)
        account
         [X] 0001_initial
         [X] 0002_email_max_length
        admin
         [X] 0001_initial
         [X] 0002_logentry_remove_auto_add
         [X] 0003_logentry_add_action_flag_choices
        auth
         [X] 0001_initial
         [X] 0002_alter_permission_name_max_length
         [X] 0003_alter_user_email_max_length
         [X] 0004_alter_user_username_opts
         [X] 0005_alter_user_last_login_null
         [X] 0006_require_contenttypes_0002
         [X] 0007_alter_validators_add_error_messages
         [X] 0008_alter_user_username_max_length
         [X] 0009_alter_user_last_name_max_length
         [X] 0010_alter_group_name_max_length
         [X] 0011_update_proxy_permissions
        authtoken
         [X] 0001_initial
         [X] 0002_auto_20160226_1747
        brokerage
         [X] 0001_initial
        contenttypes
         [X] 0001_initial
         [X] 0002_remove_content_type_name
        django_celery_beat
         [X] 0001_initial
         [X] 0002_auto_20161118_0346
         [X] 0003_auto_20161209_0049
         [X] 0004_auto_20170221_0000
         [X] 0005_add_solarschedule_events_choices
         [X] 0006_auto_20180322_0932
         [X] 0007_auto_20180521_0826
         [X] 0008_auto_20180914_1922
         [X] 0006_auto_20180210_1226
         [X] 0006_periodictask_priority
         [X] 0009_periodictask_headers
         [X] 0010_auto_20190429_0326
         [X] 0011_auto_20190508_0153
        sessions
         [X] 0001_initial
        sites
         [X] 0001_initial
         [X] 0002_alter_domain_unique
         [X] 0003_set_site_domain_and_name
        socialaccount
         [X] 0001_initial
         [X] 0002_token_max_lengths
         [X] 0003_extra_data_default_dict
        users
         [X] 0001_initial
         [X] 0002_auto_20190802_1246

### media files & uploads

- docker ps

        CONTAINER ID        IMAGE                                       COMMAND                  CREATED             STATUS              PORTS                                      NAMES
        c1c21c3d04cf        gfbio_submissions_production_traefik        "/entrypoint.sh trae…"   13 hours ago        Up 11 hours         0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp   gfbio_submissions_traefik_1_309dd0c514ca
        480da73c9374        gfbio_submissions_production_django         "/entrypoint /start"     13 hours ago        Up 11 hours                                                    gfbio_submissions_django_1_b34b3e516163
        6a0ca2bd2392        gfbio_submissions_production_flower         "/entrypoint /start-…"   13 hours ago        Up 11 hours         0.0.0.0:5555->5555/tcp                     gfbio_submissions_flower_1_683d3b750315
        cbf2c5eff2ee        gfbio_submissions_production_celeryworker   "/entrypoint /start-…"   13 hours ago        Up 11 hours                                                    gfbio_submissions_celeryworker_1_14e0b2a6ae5b
        3ec75df28b13        gfbio_submissions_production_postgres       "docker-entrypoint.s…"   16 hours ago        Up 11 hours         5432/tcp                                   gfbio_submissions_postgres_1_c9ce6411f649
        81720d4636ed        redis:5.0                                   "docker-entrypoint.s…"   16 hours ago        Up 11 hours         6379/tcp                                   gfbio_submissions_redis_1_ce86117f9c80
        
- docker exec -u 0 -it gfbio_submissions_django_1_b34b3e516163 sh


- /app/gfbio_submissions # ls -lh

        (...)
        drwxr-xr-x  123 999      root       12.0K Aug  1 09:22 media
        drwxr-xr-x    1 django   root        4.0K Aug 12 15:38 static
        (...)
        
- /app/gfbio_submissions # chown -R django media/
- /app/gfbio_submissions # chgrp -R root media/
- /app/gfbio_submissions # ls -lh

        (...)
        drwxr-xr-x  123 django   root       12.0K Aug  1 09:22 media
        drwxr-xr-x    1 django   root        4.0K Aug 12 15:38 static
        (...)
        

--------------------------------------------------------------------------------

## Standard deployment/release procedure for production server (work in progress ...)

- https://cookiecutter-django.readthedocs.io/en/latest/deployment-with-docker.html

### Local 

- git flow release start 1.76.0
- bump VERSION in base.py
- git commit -a
- comment sth. like 'release/1.76.0'
- git flow release finish 1.76.0
- enter tag liek '1.76.0'
- git push origin master develop --tags

#### copy env (needs improvement ...)

- scp -r .envs/ cloud@141.5.106.43:/home/cloud/
 

### Remote

- ssh -l cloud 141.5.106.43
- pwd

        /home/cloud

- sudo cp -r .envs/ /var/www/gfbio_submissions/
- cd /var/www/gfbio_submissions/

#### (optional) get some infos

- sudo supervisorctl status

        gfbio_submissions                RUNNING   pid 29557, uptime 2 days, 17:47:34

- docker ps

        CONTAINER ID        IMAGE                                       COMMAND                  CREATED             STATUS              PORTS                                      NAMES
        f28cc8aad1ac        gfbio_submissions_production_traefik        "/entrypoint.sh trae…"   2 days ago          Up 2 days           0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp   gfbio_submissions_traefik_1_fc25be00f85e
        8f5b12ca8320        gfbio_submissions_production_flower         "/entrypoint /start-…"   2 days ago          Up 2 days           0.0.0.0:5555->5555/tcp                     gfbio_submissions_flower_1_afd554d50373
        b13a413198ab        gfbio_submissions_production_celerybeat     "/entrypoint /start-…"   2 days ago          Up 2 days                                                      gfbio_submissions_celerybeat_1_ed9a1bba5512
        7e718fe123b8        gfbio_submissions_production_celeryworker   "/entrypoint /start-…"   2 days ago          Up 2 days                                                      gfbio_submissions_celeryworker_1_3899ee795de3
        68786aa83be6        gfbio_submissions_production_django         "/entrypoint /start"     2 days ago          Up 2 days                                                      gfbio_submissions_django_1_93243df2bea4
        b36313187b81        redis:5.0                                   "docker-entrypoint.s…"   2 days ago          Up 2 days           6379/tcp                                   gfbio_submissions_redis_1_347eb4ded6ea
        ce8ad07273ab        gfbio_submissions_production_postgres       "docker-entrypoint.s…"   2 days ago          Up 2 days           5432/tcp                                   gfbio_submissions_postgres_1_3d850a07f0d9

- remove dangling images before build etc ...: docker image prune

#### backups and related 

- docker-compose -f production.yml run --rm postgres backup

        Backing up the 'gfbio_submissions' database...
        SUCCESS: 'gfbio_submissions' database backup 'backup_2019_09_16T07_32_41.sql.gz' has been created and placed in '/backups'.

- list backups: docker-compose -f production.yml exec postgres backups
- sudo docker cp <CONTAINER_ID>:/backups/<BACKUPFILE> /var/www/gfbio_submissions/backups/

##### move backups unitl location has been fixed

- pwd: /var/www/gfbio_submissions/backups
- sudo mv *.gz ../../backups/
- login and check backups folder on container: docker exec -u 0 -it gfbio_submissions_django_1_cd5d3cd87f17 sh


#### continue actual release
       
- sudo git fetch
- sudo git checkout 1.76.0
- time (sudo ?) docker-compose -f production.yml build
        
        
        OLD:
        ----
        real	91m51,295s
        user	2m49,542s
        sys	6m44,515s

        NOW:
        ---
        real	0m34,405s
        user	0m4,651s
        sys	0m1,358s
        
- docker-compose -f production.yml run --rm django python manage.py migrate 
- docker-compose -f production.yml run --rm django python manage.py collectstatic

### avoid multiple container instances by stopping explictly ...

- sudo supervisorctl stop gfbio_submissions

- docker-compose -f production.yml down
- sudo supervisorctl start gfbio_submissions
- (tail -f logs/docker-compose_supervisord.log)

#### (be careful !) prune images and volumes


- make sure docker stack is up and running, otherwise ALL volumes are deleted,
    including database and backups and media !

- after stopping supervisord, also apply docker down, then start supervisor and check log with tail -f

- if docker stack is up (docker ps) consider prune. especially prune image should free some space

- docker image prune
  
        WARNING! This will remove all dangling images.
        Are you sure you want to continue? [y/N] y
        Deleted Images:
        deleted: sha256:3a55222d1d049cbd64fb7da2e3feb396b44bfbbbf8cff2695c0b34e1b26bb7fc
        deleted: sha256:af73a9e34f7fa8247abade0c9e1a1273fb7c87d454de6f565d6a8c9be863b19d
        deleted: sha256:8efe55acda7153930f39d85213d8b239d9476da36fc443fb0d03d617834cbffc
        deleted: sha256:4c1e18a7fd025de102d2673b4c2201fe89cebeed56ba16af371ff9adb0c9ec27
        deleted: sha256:cba299328f1f0998b894dec75f5b257dfaeabda4089f274f3f7e54ca8efeef1f
        deleted: sha256:dc858777ed034c72e7551cd09a3ae8738b89e9427f945bc55f01df0fefa8776d
        deleted: sha256:9cc9e3cbf851410c7e69eb1cd8a2b88741af285a68ee9967b00dd610f8375740
        
        Total reclaimed space: 8.279GB

- docker volume prune
 
        WARNING! This will remove all local volumes not used by at least one container.
        Are you sure you want to continue? [y/N] y
        Deleted Volumes:
        7932976e2d2ce7b97a7b50492b8b9c6c4084823426be420ecb8f227e18a7ddd7
        
        Total reclaimed space: 819.4kB


--------------------------------------------------------------------------------


## 14.08. disk full sentry error (1.75.1)

- docker volume prune ~4 Gb
- docker image prune ~ 112 Gb
- df -h

        Filesystem      Size  Used Avail Use% Mounted on
        udev            7,9G     0  7,9G   0% /dev
        tmpfs           1,6G  8,9M  1,6G   1% /run
        /dev/vda1       158G   40G  112G  26% /
        tmpfs           7,9G     0  7,9G   0% /dev/shm
        tmpfs           5,0M     0  5,0M   0% /run/lock
        tmpfs           7,9G     0  7,9G   0% /sys/fs/cgroup
        tmpfs           1,6G     0  1,6G   0% /run/user/1000


- time sudo docker-compose -f production.yml build

        real	70m47,452s
        user	2m36,691s
        sys	5m15,362s
- sudo supervisorctl stop gfbio_submissions
 -df -h
 
        Filesystem      Size  Used Avail Use% Mounted on
        udev            7,9G     0  7,9G   0% /dev
        tmpfs           1,6G  8,3M  1,6G   1% /run
        /dev/vda1       158G   71G   81G  47% /
        tmpfs           7,9G     0  7,9G   0% /dev/shm
        tmpfs           5,0M     0  5,0M   0% /run/lock
        tmpfs           7,9G     0  7,9G   0% /sys/fs/cgroup
        tmpfs           1,6G     0  1,6G   0% /run/user/1000

- sudo supervisorctl start gfbio_submissions

## Libraries to inspect

- https://github.com/core-api/python-client
- https://github.com/core-api/core-api/


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

#### no database content

After cleaning users app:

- git pull origin feature/GFBIO-2448-major-update 
- ls gfbio_submissions/users/migrations/  --> initial only
- copy all : time docker-compose -f production.yml build
- run for show etc.: docker-compose -f production.yml up

- docker-compose -f production.yml exec postgres restore backup_2019_08_08T12_10_47.sql.gz

        SUCCESS: The 'gfbio_submissions' database has been restored from the '/backups/backup_2019_08_08T12_10_47.sql.gz' backup.


          docker-compose -f local.yml run --rm django python manage.py makemigrations
         2015  docker-compose -f local.yml run --rm django python manage.py migrate
         2016  docker-compose -f local.yml run --rm django python manage.py showmigrations
         2017  docker-compose -f local.yml run --rm django python manage.py migrate --fake users zero
         2018  docker-compose -f local.yml run --rm django python manage.py showmigrations
         2019  rm gfbio_submissions/users/migrations/000*
         2020  ll gfbio_submissions/users/migrations/
         2021  docker-compose -f local.yml run --rm django python manage.py showmigrations
         2022  docker-compose -f local.yml run --rm django python manage.py migrate
         2023  docker-compose -f local.yml run --rm django python manage.py makemigrations users
         2024  docker-compose -f local.yml run --rm django python manage.py migrate
         2025  docker-compose -f local.yml run --rm django python manage.py migrate --fake users zero
         2026  rm gfbio_submissions/users/migrations/000*
         2027  docker-compose -f local.yml run --rm django python manage.py showmigrations
         2028  docker-compose -f local.yml run --rm django python manage.py makemigrations users
         2029  docker-compose -f local.yml run --rm django python manage.py migrate users --fake-initial
         2030  docker-compose -f local.yml run --rm django python manage.py showmigrations
         2031  docker-compose -f local.yml run --rm django python manage.py migrate
         2032  docker-compose -f local.yml run --rm django python manage.py migrate --fake
         2033  docker-compose -f local.yml run --rm django python manage.py showmigrations
         2034  history 


--------------------------------------------------------------------------------




1. docker-compose -f production.yml run --rm django python manage.py migrate
    - works, incl. brokerage and users migrations
    - docker-compose -f production.yml run --rm django python manage.py showmigrations
    
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

2. docker cp backup_2019_08_08T12_10_47.sql.gz 2137fc772811:/backups/
3. docker-compose -f production.yml exec postgres restore backup_2019_08_08T12_10_47.sql.gz
    - in case postfres has to be started alone: 
        - docker start gfbio_submissions_postgres_1_da50ca9dd75e
        - docker stop gfbio_submissions_postgres_1_da50ca9dd75e
    
                SUCCESS: The 'gfbio_submissions' database has been restored from the '/backups/backup_2019_08_08T12_10_47.sql.gz' backup./
        
        - docker-compose -f production.yml up
        - docker-compose -f production.yml run --rm django python manage.py showmigrations
        - migrations now comming from the dump, if i would now run migrate some 
            brokerage & users changes are already there and cause errors
            
                -> django.db.utils.ProgrammingError: column "is_site" of relation "users_user" already exist
            
                account
                 [X] 0001_initial
                 [X] 0002_email_max_length
                admin
                 [X] 0001_initial
                 [X] 0002_logentry_remove_auto_add
                 [ ] 0003_logentry_add_action_flag_choices
                auth
                 [X] 0001_initial
                 [X] 0002_alter_permission_name_max_length
                 [X] 0003_alter_user_email_max_length
                 [X] 0004_alter_user_username_opts
                 [X] 0005_alter_user_last_login_null
                 [X] 0006_require_contenttypes_0002
                 [X] 0007_alter_validators_add_error_messages
                 [X] 0008_alter_user_username_max_length
                 [ ] 0009_alter_user_last_name_max_length
                 [ ] 0010_alter_group_name_max_length
                 [ ] 0011_update_proxy_permissions
                authtoken
                 [X] 0001_initial
                 [X] 0002_auto_20160226_1747
                brokerage
                 [X] 0001_initial
                contenttypes
                 [X] 0001_initial
                 [X] 0002_remove_content_type_name
                django_celery_beat
                 [ ] 0001_initial
                 [ ] 0002_auto_20161118_0346
                 [ ] 0003_auto_20161209_0049
                 [ ] 0004_auto_20170221_0000
                 [ ] 0005_add_solarschedule_events_choices
                 [ ] 0006_auto_20180322_0932
                 [ ] 0007_auto_20180521_0826
                 [ ] 0008_auto_20180914_1922
                 [ ] 0006_auto_20180210_1226
                 [ ] 0006_periodictask_priority
                 [ ] 0009_periodictask_headers
                 [ ] 0010_auto_20190429_0326
                 [ ] 0011_auto_20190508_0153
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
                 [ ] 0002_auto_20190802_1246
        
        
        
        
        
        
        
        
        
        
- (optional) create super user for checking:

        docker-compose -f production.yml run --rm django python manage.py createsuperuser

- copy database dump to newer postgres container
- stack has to be up and running, using second shell:
- get postgres container id, then cp backupfile: 

        docker ps
        docker cp backup_2019_08_08T12_10_47.sql.gz 6295d807d4ae:/backups/
        docker-compose -f production.yml exec postgres restore backup_2019_08_08T12_10_47.sql.gz
        SUCCESS: The 'gfbio_submissions' database has been restored from the '/backups/backup_2019_08_08T12_10_47.sql.gz' backup.
        
        
        





            
- docker-compose -f production.yml run --rm django python manage.py showmigrations

        account
         [X] 0001_initial
         [X] 0002_email_max_length
        admin
         [X] 0001_initial
         [X] 0002_logentry_remove_auto_add
         [ ] 0003_logentry_add_action_flag_choices
        auth
         [X] 0001_initial
         [X] 0002_alter_permission_name_max_length
         [X] 0003_alter_user_email_max_length
         [X] 0004_alter_user_username_opts
         [X] 0005_alter_user_last_login_null
         [X] 0006_require_contenttypes_0002
         [X] 0007_alter_validators_add_error_messages
         [X] 0008_alter_user_username_max_length
         [ ] 0009_alter_user_last_name_max_length
         [ ] 0010_alter_group_name_max_length
         [ ] 0011_update_proxy_permissions
        authtoken
         [X] 0001_initial
         [X] 0002_auto_20160226_1747
        brokerage
         [X] 0001_initial
        contenttypes
         [X] 0001_initial
         [X] 0002_remove_content_type_name
        django_celery_beat
         [ ] 0001_initial
         [ ] 0002_auto_20161118_0346
         [ ] 0003_auto_20161209_0049
         [ ] 0004_auto_20170221_0000
         [ ] 0005_add_solarschedule_events_choices
         [ ] 0006_auto_20180322_0932
         [ ] 0007_auto_20180521_0826
         [ ] 0008_auto_20180914_1922
         [ ] 0006_auto_20180210_1226
         [ ] 0006_periodictask_priority
         [ ] 0009_periodictask_headers
         [ ] 0010_auto_20190429_0326
         [ ] 0011_auto_20190508_0153
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
         [ ] 0002_auto_20190802_1246


       
       
- check supervisor configuration in /etc/supervisor/conf.d (still working)












- ERROR:  relation "django_celery_beat_periodictask" does not exist at character 1026

    - reset migrations ?

- fix migrations
    
    - build as usual -> empty database
    - docker-compose -f production.yml up
    - restore from backup
    - docker-compose -f production.yml run --rm django python manage.py showmigrations
    -  docker-compose -f production.yml run --rm django python manage.py makemigrations
            
            No changes detected
    
                            - docker-compose -f production.yml run --rm django python manage.py migrate --fake brokerage zero
                            
                                    Operations to perform:
                                      Unapply all migrations: brokerage
                                    Running migrations:
                                      Rendering model states... DONE
                                      Unapplying brokerage.0001_initial... FAKED
                        
                            -  docker-compose -f production.yml run --rm django python manage.py migrate --fake users zero
                            
                                    Operations to perform:
                                      Unapply all migrations: users
                                    Running migrations:
                                      Rendering model states... DONE
                                      Unapplying socialaccount.0003_extra_data_default_dict... FAKED
                                      Unapplying socialaccount.0002_token_max_lengths... FAKED
                                      Unapplying socialaccount.0001_initial... FAKED
                                      Unapplying authtoken.0002_auto_20160226_1747... FAKED
                                      Unapplying authtoken.0001_initial... FAKED
                                      Unapplying admin.0002_logentry_remove_auto_add... FAKED
                                      Unapplying admin.0001_initial... FAKED
                                      Unapplying account.0002_email_max_length... FAKED
                                      Unapplying account.0001_initial... FAKED
                                      Unapplying users.0001_initial... FAKED
                        
                                - remove all migrations of brokerage and users
                                
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions/brokerage/migrations# ls
                                        0001_initial.py  __init__.py
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions/brokerage/migrations# rm 0001_initial.py 
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions/brokerage/migrations# cd ..
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions/brokerage# cd ..
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions# cd users/migrations/
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions/users/migrations# ls
                                        0001_initial.py  0002_auto_20190802_1246.py  __init__.py
                                        root@monstermagnet:/var/www/gfbio_submissions/gfbio_submissions/users/migrations# rm 0001_initial.py 0002_auto_20190802_1246.py 
                        
                                - time docker-compose -f production.yml build
                                - docker-compose -f production.yml run --rm django python manage.py showmigrations
                                
                                        account
                                         [ ] 0001_initial
                                         [ ] 0002_email_max_length
                                        admin
                                         [ ] 0001_initial
                                         [ ] 0002_logentry_remove_auto_add
                                         [ ] 0003_logentry_add_action_flag_choices
                                        auth
                                         [X] 0001_initial
                                         [X] 0002_alter_permission_name_max_length
                                         [X] 0003_alter_user_email_max_length
                                         [X] 0004_alter_user_username_opts
                                         [X] 0005_alter_user_last_login_null
                                         [X] 0006_require_contenttypes_0002
                                         [X] 0007_alter_validators_add_error_messages
                                         [X] 0008_alter_user_username_max_length
                                         [ ] 0009_alter_user_last_name_max_length
                                         [ ] 0010_alter_group_name_max_length
                                         [ ] 0011_update_proxy_permissions
                                        authtoken
                                         [ ] 0001_initial
                                         [ ] 0002_auto_20160226_1747
                                        brokerage
                                         (no migrations)
                                        contenttypes
                                         [X] 0001_initial
                                         [X] 0002_remove_content_type_name
                                        django_celery_beat
                                         [ ] 0001_initial
                                         [ ] 0002_auto_20161118_0346
                                         [ ] 0003_auto_20161209_0049
                                         [ ] 0004_auto_20170221_0000
                                         [ ] 0005_add_solarschedule_events_choices
                                         [ ] 0006_auto_20180322_0932
                                         [ ] 0007_auto_20180521_0826
                                         [ ] 0008_auto_20180914_1922
                                         [ ] 0006_auto_20180210_1226
                                         [ ] 0006_periodictask_priority
                                         [ ] 0009_periodictask_headers
                                         [ ] 0010_auto_20190429_0326
                                         [ ] 0011_auto_20190508_0153
                                        sessions
                                         [X] 0001_initial
                                        sites
                                         [X] 0001_initial
                                         [X] 0002_alter_domain_unique
                                         [X] 0003_set_site_domain_and_name
                                        socialaccount
                                         [ ] 0001_initial
                                         [ ] 0002_token_max_lengths
                                         [ ] 0003_extra_data_default_dict
                                        users
                                         (no migrations)
                                
                                FAILS ...-> 
                          raise ValueError("Dependency on app with no migrations: %s" % key[0])
ValueError: Dependency on app with no migrations: users

TODO: TRY AGAIN for brokergae only start with applying pending migrations of all other apps

-------------------------------------------------------------------

- time docker-compose -f production.yml build
- docker-compose -f production.yml up
- deleted migration files of users & brokerage
- docker-compose -f production.yml run --rm django python manage.py showmigrations

        account
         [ ] 0001_initial
         [ ] 0002_email_max_length
        admin
         [ ] 0001_initial
         [ ] 0002_logentry_remove_auto_add
         [ ] 0003_logentry_add_action_flag_choices
        auth
         [ ] 0001_initial
         [ ] 0002_alter_permission_name_max_length
         [ ] 0003_alter_user_email_max_length
         [ ] 0004_alter_user_username_opts
         [ ] 0005_alter_user_last_login_null
         [ ] 0006_require_contenttypes_0002
         [ ] 0007_alter_validators_add_error_messages
         [ ] 0008_alter_user_username_max_length
         [ ] 0009_alter_user_last_name_max_length
         [ ] 0010_alter_group_name_max_length
         [ ] 0011_update_proxy_permissions
        authtoken
         [ ] 0001_initial
         [ ] 0002_auto_20160226_1747
        brokerage
         (no migrations)
        contenttypes
         [ ] 0001_initial
         [ ] 0002_remove_content_type_name
        django_celery_beat
         [ ] 0001_initial
         [ ] 0002_auto_20161118_0346
         [ ] 0003_auto_20161209_0049
         [ ] 0004_auto_20170221_0000
         [ ] 0005_add_solarschedule_events_choices
         [ ] 0006_auto_20180322_0932
         [ ] 0007_auto_20180521_0826
         [ ] 0008_auto_20180914_1922
         [ ] 0006_auto_20180210_1226
         [ ] 0006_periodictask_priority
         [ ] 0009_periodictask_headers
         [ ] 0010_auto_20190429_0326
         [ ] 0011_auto_20190508_0153
        sessions
         [ ] 0001_initial
        sites
         [ ] 0001_initial
         [ ] 0002_alter_domain_unique
         [ ] 0003_set_site_domain_and_name
        socialaccount
         [ ] 0001_initial
         [ ] 0002_token_max_lengths
         [ ] 0003_extra_data_default_dict
        users
         (no migrations)
         
-  docker-compose -f production.yml exec postgres restore backup_2019_08_08T12_10_47.sql.gz

        SUCCESS: The 'gfbio_submissions' database has been restored from the '/backups/backup_2019_08_08T12_10_47.sql.gz' backup.
        
-  docker-compose -f production.yml run --rm django python manage.py showmigrations

         account
         [X] 0001_initial
         [X] 0002_email_max_length
        admin
         [X] 0001_initial
         [X] 0002_logentry_remove_auto_add
         [ ] 0003_logentry_add_action_flag_choices
        auth
         [X] 0001_initial
         [X] 0002_alter_permission_name_max_length
         [X] 0003_alter_user_email_max_length
         [X] 0004_alter_user_username_opts
         [X] 0005_alter_user_last_login_null
         [X] 0006_require_contenttypes_0002
         [X] 0007_alter_validators_add_error_messages
         [X] 0008_alter_user_username_max_length
         [ ] 0009_alter_user_last_name_max_length
         [ ] 0010_alter_group_name_max_length
         [ ] 0011_update_proxy_permissions
        authtoken
         [X] 0001_initial
         [X] 0002_auto_20160226_1747
        brokerage
         (no migrations)
        contenttypes
         [X] 0001_initial
         [X] 0002_remove_content_type_name
        django_celery_beat
         [ ] 0001_initial
         [ ] 0002_auto_20161118_0346
         [ ] 0003_auto_20161209_0049
         [ ] 0004_auto_20170221_0000
         [ ] 0005_add_solarschedule_events_choices
         [ ] 0006_auto_20180322_0932
         [ ] 0007_auto_20180521_0826
         [ ] 0008_auto_20180914_1922
         [ ] 0006_auto_20180210_1226
         [ ] 0006_periodictask_priority
         [ ] 0009_periodictask_headers
         [ ] 0010_auto_20190429_0326
         [ ] 0011_auto_20190508_0153
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
         (no migrations)

- docker-compose -f production.yml run --rm django python manage.py makemigrations

    
        
--------------------------------------------------------------



- flower ? added port 5555 tcp & udp in gwdg sec. group default rules


## Libraries to inspect

- https://github.com/core-api/python-client
- https://github.com/core-api/core-api/


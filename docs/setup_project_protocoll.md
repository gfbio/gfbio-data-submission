# Setup Protocoll & Notes

## Project 

### cookie-cutter setup

- maweber@sprotte:~/devel$ workon cookiecutter
- cookiecutter https://github.com/pydanny/cookiecutter-django.git --checkout 1.11.10

        You've downloaded /home/maweber/.cookiecutters/cookiecutter-django before. Is it okay to delete and re-download it? [yes]: 
        project_name [Project Name]: GFBio Submissions
        project_slug [gfbio_submissions]: 
        author_name [Daniel Roy Greenfeld]: Marc Weber
        email [you@example.com]: maweber@mpi-bremen.de
        description [A short description of the project.]: Submission services provided by GFBio
        domain_name [example.com]: submissions.gfbio.org            
        version [0.1.0]: 1.58.2
        timezone [UTC]: UTC
        use_whitenoise [y]: 
        use_celery [n]: y
        use_mailhog [n]: 
        use_sentry_for_error_reporting [y]: 
        use_opbeat [n]: 
        use_pycharm [n]: y
        windows [n]: 
        use_docker [n]: y
        use_heroku [n]: 
        use_compressor [n]: 
        Select postgresql_version:
        1 - 10
        2 - 9.6
        3 - 9.5
        4 - 9.4
        5 - 9.3
        6 - 9.2
        Choose from 1, 2, 3, 4, 5, 6 [1]: 
        Select js_task_runner:
        1 - Gulp
        2 - Grunt
        3 - None
        Choose from 1, 2, 3 [1]: 3
        custom_bootstrap_compilation [n]: 
        Select open_source_license:
        1 - MIT
        2 - BSD
        3 - GPLv3
        4 - Apache Software License 2.0
        5 - Not open source
        Choose from 1, 2, 3, 4, 5 [1]:
       
### General local setup

compare http://cookiecutter-django.readthedocs.io/en/latest/developing-locally-docker.html

- pwd

        /home/maweber/devel/gfbio_submissions

- cp ../gfbio_submissions/.gitignore .
- git init
- git flow init
- git add --all
- git commit -m "develop Initial Commit"
- git remote add origin https://maweber@colab.mpi-bremen.de/stash/scm/gfbio/gfbio_submissions.git
- git push -u origin master develop

### Docker commands

#### local

- docker-compose -f local.yml build
- docker-compose -f local.yml run --rm django python manage.py migrate
- docker-compose -f local.yml run --rm django python manage.py createsuperuser

        Starting gfbio_submissions_postgres_1 ... done
        Postgres is up - continuing...
        Username: maweber
        Email address: maweber@mpi-bremen.de
        Password: test1234
        Password (again): 
        Superuser created successfully.

- docker-compose -f local.yml up
- docker-compose -f local.yml down


##### run locally

    docker-compose -f local.yml up
    docker-compose -f local.yml run --rm django python manage.py migrate
    docker-compose -f local.yml run --rm django python manage.py createsuperuser
    docker-compose -f local.yml run --rm django python manage.py makemigrations
    docker-compose -f local.yml run --rm django python manage.py collectstatic
    
##### Migrate Brokerage App only

    docker-compose -f local.yml run --rm django python manage.py makemigrations brokerage

    
- maweber:test1234

#### delete local database within postgres container

- docker exec -it gfbio_submissions_postgres_1 psql -U postgres

        psql (10.4 (Debian 10.4-2.pgdg90+1))
        Type "help" for help.
        
        postgres=# DROP DATABASE test_gfbio_submissions;
        DROP DATABASE
        postgres=# \q

#### access database on production

- access database on production system

        docker exec -it 8923a80dbe17 psql -U gds_docker_db
        
#### access container as user root

- docker exec -u 0 -it 0fb80266fd74 bash

#### Reset migrations

- follow this: https://simpleisbetterthancomplex.com/tutorial/2016/07/26/how-to-reset-migrations.html
- BUT: do this locally with local.yaml settings
- keep in mind that you need to build to copy files to docker (or do it manually)
- once done: commit and release
- then build, restart production system using new initial migrations
- this had to be applied after loading a dump from old GDS to new "submissions" server ...

#### Mail setup

    EMAIL_USE_TLS = True
    EMAIL_HOST = 'mail.sd-datasolutions.de'
    EMAIL_HOST_USER = 'gfbio-broker'
    EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD')
    EMAIL_PORT = 587

- user: gfbio-broker
- password -> passwordmanager/.env
- webmail: https://mail.sd-datasolutions.de

        Spam ist aktiv, kannst aber eigene regeln und imap folder anlegen
        imap (beides SSL und startls) via selben hostnamen. 
        Mail versenden auch via SUBMISSION über startls.
        Achtung:@gfbio.org hat in den Mails als SPF drinnen dass nur mails von 
        bestimmten servern kommen, wenn du direkt mails von dem gwdg ding senden
        willst, muss ich es eintragen. aber alternativ via submission an den
        obigen mailserver derzeit dürfen nur die mail versenden: 
        TXT v=spf1 a:mailout.sd-datasolutions.de a:pangaea-mw2.marum.de 
        a:pangaea-pm.marum.de ptr:mpi-bremen.de -all

#### Environment Variables

- encrypted (!) .env file under Version Control
- NEVER add decrypted version of this File to Version Control 
- after changes encrypt with 

        gpg -vco encrypted.env.gpg .env
        
- decrypt this to .env on production system

        gpg -o .env encrypted.env.gpg 

- password in password manager


## GWDG Cloud Server

Access via https://www.gwdg.de/server-services/gwdg-cloud-server/self-service

### Setup

#### Host 

- mastodon
- 141.5.106.43
- c106-043.cloud.gwdg.de
- submissions.gfbio.org


    mastodon
    Public IP
    141.5.106.43
    DNS: c106-043.cloud.gwdg.de
    Security Group:defaultChange
    Internal IP: 10.254.1.8
    Type: m1.xlarge
    Image: Ubuntu 18.04.1 Server x86_64
    Updated: Tue Nov 13 14:33:40 CET 2018
    ID: 2027e4cd-c6f0-40b2-874f-73572f47390c
    
    ######################################
    #                                    #
    #  The password for the user: cloud  #
    #  has been set to: PASWWORDMANAGER         #
    #                                      #
    ######################################

#### Setup Protocol

- ssh -l cloud 141.5.106.43

- uncomment canonical repos in sources.list:
- sudo vim sources.list
- sudo apt-get update
- sudo apt-get upgrade

- reboot ... kernel image has been rebuild  ... via webinterface

- sudo apt-get remove docker docker-engine docker.io
- sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
- sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
- sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
- sudo apt-get update
- sudo apt-cache policy docker-ce
- sudo apt-get install docker-ce
- docker --version
- systemctl status docker
- sudo usermod -aG docker root
- sudo usermod -aG docker ${USER}

- sudo curl -L https://github.com/docker/compose/releases/download/1.23.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
- sudo chmod +x /usr/local/bin/docker-compose 
- docker-compose --version

- sudo apt-get install supervisor
- sudo apt-get  install lftp

#### Prepare for application

- cd /var/
- sudo mkdir www
- cd www/
- sudo git clone https://maweber@colab.mpi-bremen.de/stash/scm/gfbio/gfbio_submissions.git
- cd gfbio_submissions/
- sudo git fetch
- git checkout feature/GFBIO-2165-adapt-and-deploy-submission-code 
- sudo git checkout feature/GFBIO-2165-adapt-and-deploy-submission-code 
- sudo git pull origin feature/GFBIO-2165-adapt-and-deploy-submission-code 
- sudo gpg -o .env encrypted.env.gpg
 
- pwd -> /var/www
- sudo mkdir gfbio-submission-auditing
- cd gfbio-submission-auditing/
- sudo git init
- git remote add origin https://gfbio_broker@colab.mpi-bremen.de/stash/scm/~gfbio_broker/gfbio-submission-auditing.git
- cd ..
- sudo chmod -R 775 gfbio-submission-auditing
- sudo chgrp docker gfbio-submission-auditing/


#### Docker

- http://cookiecutter-django.readthedocs.io/en/latest/deployment-with-docker.html
- for setting everything up and debugging:
        
        cloud@mastodon:/var/www/gfbio_submissions$ pwd
            /var/www/gfbio_submissions
 
         git branch 
            * feature/GFBIO-2165-adapt-and-deploy-submission-code

- sudo docker-compose -f production.yml build
- sudo docker-compose -f production.yml up (pulls missing images)
- sudo docker-compose -f production.yml run --rm django python manage.py migrate
- sudo docker-compose -f production.yml run --rm django python manage.py collectstatic
- docker-compose -f production.yml run --rm django python manage.py createsuperuser
- docker-compose -f production.yml run --rm django python manage.py raven test

        If you need a shell, run:
        
        docker-compose -f production.yml run --rm django python manage.py shell
        To check the logs out, run:
        
        docker-compose -f production.yml logs
        If you want to scale your application, run:
        
        docker-compose -f production.yml scale django=4
        docker-compose -f production.yml scale celeryworker=2
        Warning
        
        don’t try to scale postgres, celerybeat, or caddy.
        
        To see how your containers are doing run:
        
        docker-compose -f production.yml ps
        
        To see how your containers are doing run:
    
        docker-compose -f production.yml ps


## Release

### Manual release

#### Local commands

- prerequisite: feature branch(s) finished/merged back to develop
- release while on branch develop

- start release:
    
        git flow release start <VERSION_NUMBER>
        git flow release start 0.0.2

- check content of .env 
- checke that .env IS NOT under version control and/or part of the next commit
- encrypt .env (use password from password-manager)
        
        gpg -vco encrypted.env.gpg .env
        
            gpg: pinentry launched (20395 gnome3 1.1.0 /dev/pts/1 rxvt-unicode-256color :0)
            gpg: pinentry launched (20405 gnome3 1.1.0 /dev/pts/1 rxvt-unicode-256color :0)
            gpg: benutze Cipher AES256
            Datei 'encrypted.env.gpg' existiert bereits. Überschreiben (j/N)? j
            gpg: Schreiben nach 'encrypted.env.gpg'

- bump VERSION constant in base.py
- commit and comment respectively

        git commit -a
        
- finish release, add tag, save merge comments

        git flow release finish <VERSION_NUMBER>
        git flow release finish 0.0.2

- push everything to remote

        git push origin master develop --tags

#### Remote commands

- login to remote server
        
        ssh -l cloud 141.5.106.43

- cd to working directory

        cd /var/www/gfbio_submissions/
        
        pwd 
            /var/www/gfbio_submissions
        
- create postgres backup first, docker containers have to be up

        sudo supervisorctl status
            gfbio_submissions                   RUNNING   pid 25091, uptime 0:01:16
        
        sudo docker-compose -f production.yml run --rm postgres backup
            creating backup
            ---------------
            successfully created backup backup_2018_08_29T20_23_57.sql.gz


- stop docker containers via supervisor process manager
        
        sudo supervisorctl stop gfbio_submissions

- fetch latest changes from repository and checkout latest tag        
        
        sudo git fetch
        
        sudo git checkout <VERSION_NUMBER>
        sudo git checkout 0.0.2
        
        sudo git branch 
            * (HEAD detached at 0.0.2)
              develop
              master

##### Encrypted .env

- decrypt .env , use password from passwordmanager

TODO: needs improvements :
- UPDATE: 
    
        echo 'THE_PASSWORD' | sudo gpg --batch --yes --passphrase-fd 0 encrypted.env.gpg
        rm .env 
        mv encrypted.env .env

- since sudoing this freezes during execution:

         sudo gpg -o .env encrypted.env.gpg
        gpg: WARNING: unsafe ownership on homedir '/home/cloud/.gnupg'
        gpg: WARNING: no command supplied.  Trying to guess what you mean ...
        gpg: AES256 encrypted data
        ^C
        gpg: signal Interrupt caught ... exiting


- PREVIOUS VERSION:            
        sudo gpg -o .env encrypted.env.gpg

            gpg: WARNING: unsafe ownership on configuration file `/home/cloud/.gnupg/gpg.conf'
            gpg: AES256 encrypted data
            gpg: gpg-agent is not available in this session
            gpg: encrypted with 1 passphrase
            File `.env' exists. Overwrite? (y/N) y

##### Docker


- build docker images (in case requirement have been updated, etc.). may take a few minutes.

        docker-compose -f production.yml build

- apply migrations

        docker-compose -f production.yml run --rm django python manage.py migrate

- copy static files

        docker-compose -f production.yml run --rm django python manage.py collectstatic

- start docker containers via supervisor

        sudo supervisorctl start gfbio_submissions
        
        sudo supervisorctl status
            gfbio_submissions                   RUNNING   pid 26660, uptime 0:05:59

- access database on production system

        docker exec -it 8923a80dbe17 psql -U gds_docker_db

### Scripted release



## Move production database

### Commands

#### 141.5.103.171 (genomicsdataservices)

- ssh -l root 141.5.103.171
- cd /var/www/gds_docker/
- cd genomicsdataservices/
- docker-compose run postgres backup

        creating backup
        ---------------
        successfully created backup backup_2018_11_20T20_06_53.sql.gz


- docker ps

        CONTAINER ID        IMAGE                               COMMAND                  CREATED             STATUS              PORTS                                      NAMES
        (...)
        8941e03d0bcd        genomicsdataservices_postgres       "docker-entrypoint..."   4 weeks ago         Up 4 weeks          5432/tcp                                   genomicsdataservices_postgres_1
        (...)

- docker cp 8941e03d0bcd:/backups/backup_2018_11_20T20_06_53.sql.gz /var/www/gds_docker/backups2/

#### 141.5.106.43 (submissions.gfbio.org)

- ssh -l cloud 141.5.106.43
- cd /var/www/gfbio_submissions/
- sudo mkdir _prod_backup

- cd ~
- pwd

        /home/cloud

- scp root@141.5.103.171:/var/www/gds_docker/backups2/backup_2018_11_20T20_06_53.sql.gz .

        root@141.5.103.171's password: ('real' root password -> passwordmanager)

- sudo mv backup_2018_11_20T20_06_53.sql.gz /var/www/gfbio_submissions/_prod_backup/

##### Restore Backup

- cd /var/www/gfbio_submissions/_prod_backup/
- ll

        total 8492
        drwxr-xr-x  2 root  root     4096 Nov 20 21:21 ./
        drwxr-xr-x 11 root  root     4096 Nov 20 21:16 ../
        -rw-r--r--  1 cloud cloud 8687504 Nov 20 21:21 backup_2018_11_20T20_06_53.sql.gz

- pwd

        /var/www/gfbio_submissions
  
- docker ps

        CONTAINER ID        IMAGE                            COMMAND                  CREATED             STATUS              PORTS                                                NAMES
        (...)
        21b155a1cd50        gfbio_submissions_postgres       "docker-entrypoint.s…"   4 days ago          Up 4 days           5432/tcp                                             gfbio_submissions_postgres_1_a68a0cc45263
        (...)

- docker cp _prod_backup/backup_2018_11_20T20_06_53.sql.gz 21b155a1cd50:/backups/
- docker-compose -f production.yml run postgres list-backups

        listing available backups
        -------------------------
        backup_2018_11_20T11_32_05.sql.gz  backup_2018_11_20T20_06_53.sql.gz
        backup_2018_11_20T11_47_22.sql.gz  backup_2018_11_20T20_28_44.sql.gz
        backup_2018_11_20T13_13_43.sql.gz


#####  ... Current Work in progress


1. This causes errors due to missing fields

        docker-compose -f production.yml run --rm postgres restore backup_2018_11_20T20_06_53.sql.gz

1. re-set to backup from naked system 
    
        docker-compose -f production.yml run --rm postgres restore backup_2018_11_20T20_28_44.sql.gz
    
1.  just to get sure:

        sudo supervisorctl stop gfbio_submissions
        sudo supervisorctl start gfbio_submissions

1. system running again ...

1. apply code changes to ensure backward compatibility

1. load prod db dump again 

        docker-compose -f production.yml run --rm postgres restore backup_2018_11_20T20_06_53.sql.gz

1. db looks good, but some error still popping up
        
        CREATE TABLE
        ERROR:  role "gds_docker_db" does not exist
        
        ALTER TABLE
        REVOKE
        ERROR:  role "postgres" does not exist
        ERROR:  role "postgres" does not exist
        GRANT

TODO: compare dockerfiles and env for these role
TODO: look into BOTH dumps prod db & naked sys dump
TODO: test migrating old db state to TimeBasedModel version (prepare)

### "The Plan"



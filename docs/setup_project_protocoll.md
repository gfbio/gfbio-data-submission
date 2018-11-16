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

- cp ../gfbio_services/.gitignore .
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



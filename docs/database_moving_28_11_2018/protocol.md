# Move Database from 141.5.103.171 to 141.5.106.43

## History of commands in chronological order

### 141.5.103.171 (1/2)

A log of all commands entered in this ssh session is available here: logs/141.5.103.171.log.txt .

    maweber@makrele:~$ ssh -l root 141.5.103.171
    
    root@monstermagnet:~# supervisorctl stop genomicsdataservices
    
    root@monstermagnet:~# cd /var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui/
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# rm molecular
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# ln -s molecular_maintenance/ molecular
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# cd /var/www/gds_docker/genomicsdataservices/
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# docker-compose build
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# supervisorctl start genomicsdataservices
   
To prevent new submissions etc., all user-accounts were disabled via the django-admin, except admin users.
Then the database backup was created:
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# docker-compose run postgres backup
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# docker cp 8941e03d0bcd:/backups/backup_2018_11_28T10_13_31.sql.gz /var/www/gds_docker/


### 141.5.106.43 (1/1)

A log of all commands entered in this ssh session is available here: logs/141.5.106.43.log.txt .

    maweber@makrele:~$ ssh -l cloud 141.5.106.43
    
    cloud@mastodon:~$ cd /home/cloud/
    
    cloud@mastodon:~$ scp root@141.5.103.171:/var/www/gds_docker/backup_2018_11_28T10_13_31.sql.gz .
        root@141.5.103.171's password:
        backup_2018_11_28T10_13_31.sql.gz                                 100% 8715KB  56.2MB/s   00:00
    
    cloud@mastodon:~$ sudo mv backup_2018_11_28T10_13_31.sql.gz /var/www/gfbio_submissions/
    
    cloud@mastodon:~$ cd /var/www/gfbio_submissions/
    
    cloud@mastodon:/var/www/gfbio_submissions$ docker ps
        CONTAINER ID        IMAGE                            COMMAND                  CREATED             STATUS              PORTS                                                NAMES
        38ce0d4ce8fa        gfbio_submissions_caddy          "/usr/bin/caddy --co…"   21 hours ago        Up 21 hours         0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp, 2015/tcp   gfbio_submissions_caddy_1_2e0f5b821b8e
        97b8f91c393c        gfbio_submissions_celeryworker   "/entrypoint.sh /sta…"   21 hours ago        Up 21 hours                                                              gfbio_submissions_celeryworker_1_9308fd46db8c
        8d0f16d05e37        gfbio_submissions_celerybeat     "/entrypoint.sh /sta…"   21 hours ago        Up 21 hours                                                              gfbio_submissions_celerybeat_1_7f2533d3cd9f
        393e8a732eb0        gfbio_submissions_django         "/entrypoint.sh /gun…"   21 hours ago        Up 21 hours                                                              gfbio_submissions_django_1_946b33fd827a
        8923a80dbe17        gfbio_submissions_postgres       "docker-entrypoint.s…"   21 hours ago        Up 21 hours         5432/tcp                                             gfbio_submissions_postgres_1_4f816ab1eb1f
        eb1b45080f6e        redis:3.0                        "docker-entrypoint.s…"   22 hours ago        Up 21 hours         6379/tcp                                             gfbio_submissions_redis_1_bcbbdefffac0
    
    cloud@mastodon:/var/www/gfbio_submissions$ docker cp backup_2018_11_28T10_13_31.sql.gz 8923a80dbe17:/backups/
    
    cloud@mastodon:/var/www/gfbio_submissions$ docker-compose -f production.yml run --rm postgres restore backup_2018_11_28T10_13_31.sql.gz

A new version of the ena-widget was deployed/copied to this host. All submissions will now be posted
to "/" (this host). Description of build and release from local laptop is omitted, but all commands
entered in local shell are available here: logs/localhost.log.txt.

#### after transferring new build to this host

    cloud@mastodon:/var/www/gfbio_submissions$ sudo supervisorctl stop gfbio_submissions

    cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions/static/ui$ sudo mv molecular/ _molecular

    cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions/static/ui$ cd

    cloud@mastodon:~$ l
        backup_2018_11_20T20_06_53.sql.gz  backup_2018_11_20T20_28_44.sql.gz  build/
    
    cloud@mastodon:~$ sudo cp -r build/ /var/www/gfbio_submissions/gfbio_submissions/static/ui/molecular_app

    cloud@mastodon:~$ cd /var/www/gfbio_submissions/gfbio_submissions/static/ui/molecular_app

    cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions/static/ui$ sudo ln -s molecular_app/ molecular

    cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions/static/ui$ cd ..

    cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions/static$ cd ..

    cloud@mastodon:/var/www/gfbio_submissions/gfbio_submissions$ cd ..

    cloud@mastodon:/var/www/gfbio_submissions$ sudo docker-compose -f production.yml build

    cloud@mastodon:/var/www/gfbio_submissions$ sudo supervisorctl start gfbio_submissions



### 141.5.103.171 (2/2)

#### Deploy new version of ena-widget 

A new version of the ena-widget was deployed/copied to this host. All submissions will now be posted
to "submission.gfbio.org". Description of build and release from local laptop is omitted, but all commands
entered in local shell are available here: logs/localhost.log.txt.

##### delete widget src folder

    root@monstermagnet:/var/www/gds_docker# cd genomicsdataservices/genomicsdataservices/static/ui
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# rm -r molecular_app/

#### after transferring new build to this host

    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# ll
        total 24
        drwxr-xr-x  6 root root 4096 Nov 28 12:18 ./
        drwxr-xr-x 10 root root 4096 Apr 28  2017 ../
        drwxr-xr-x  2 root root 4096 Okt 17 15:02 mol_redux/
        lrwxrwxrwx  1 root root   22 Nov 28 11:07 molecular -> molecular_maintenance//
        drwxrwxr-x  2 root root 4096 Nov 28 12:18 molecular_app/
        drwxrwxr-x  2 root root 4096 Nov 22 21:37 molecular_maintenance/
        drwxr-xr-x  2 root root 4096 Jun 29  2017 old_molecular/
        
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# rm molecular
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# ln -s molecular_app molecular
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# ll
        total 24
        drwxr-xr-x  6 root root 4096 Nov 28 12:20 ./
        drwxr-xr-x 10 root root 4096 Apr 28  2017 ../
        drwxr-xr-x  2 root root 4096 Okt 17 15:02 mol_redux/
        lrwxrwxrwx  1 root root   13 Nov 28 12:20 molecular -> molecular_app/
        drwxrwxr-x  2 root root 4096 Nov 28 12:18 molecular_app/
        drwxrwxr-x  2 root root 4096 Nov 22 21:37 molecular_maintenance/
        drwxr-xr-x  2 root root 4096 Jun 29  2017 old_molecular/

    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui# cd ..

    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices/static# cd ..

    root@monstermagnet:/var/www/gds_docker/genomicsdataservices/genomicsdataservices# cd ..
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# supervisorctl stop genomicsdataservices
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# docker-compose build
    
    root@monstermagnet:/var/www/gds_docker/genomicsdataservices# supervisorctl start genomicsdataservices






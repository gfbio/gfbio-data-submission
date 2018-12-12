# SOP Move Database to other host


1. Enable ENA-Widget maintenance message mode

    1. ssh login on current production system
        
            ssh -l root 141.5.103.171
    
    1. stop services
    
            supervisorctl stop genomicsdataservices
      
    1.  cd to static dir containing widget sources
    
            cd /var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui/

    1. delete existing link to widget sources
    
            rm molecular
    
    1. create new link to widget with maintenance message
    
            ln -s molecular_maintenance/ molecular
    
    1. cd to project root directory
    
            cd /var/www/gds_docker/genomicsdataservices/
            
    1. re-build docker images
    
            docker-compose build
            
    1. start services
        
            supervisorctl start genomicsdataservices

1. Prevent new submission and updates

    1. login to [django amdin interface](https://c103-171.cloud.gwdg.de/admin/)
    1. go to [list of users](https://c103-171.cloud.gwdg.de/admin/users/user/) 
    1. on detail page of every user, below "Permissions", un-check active box 
        to disable this user (currently there are six active users/accounts).
        **But omit admin users** 
        
1. Dump Database

    1. ssh login on current production system
        
            ssh -l root 141.5.103.171 

    1. cd to project root directory
    
            cd /var/www/gds_docker/genomicsdataservices/
    
    1. create backup
    
            docker-compose run postgres backup
            
    1. check CONTAINER_ID of postgres image
    
            docker ps

                CONTAINER ID        IMAGE                               COMMAND                  CREATED             STATUS              PORTS                                      NAMES
                (...)
                8941e03d0bcd        genomicsdataservices_postgres       "docker-entrypoint..."   4 weeks ago         Up 4 weeks          5432/tcp                                   genomicsdataservices_postgres_1
                (...)
    
    1. copy sql dump from container to local filesystem
    
            docker cp CONTAINER_ID:/backups/backup_2018_11_20T20_06_53.sql.gz /var/www/gds_docker/
            
            e.g.:
            docker cp 8941e03d0bcd:/backups/backup_2018_11_20T20_06_53.sql.gz /var/www/gds_docker/
            
            backup_2018_11_28T10_13_31.sql.gz
1. Load database dump

    1. ssh login on other system
    
            ssh -l cloud 141.5.106.43
    
    1. copy dump from production server. due to sudo constraint, become root
        and copy the file directly or copy it to cloud users /home first, then move
        it to respective directory.
    
            cd /home/cloud
            scp root@141.5.103.171:/var/www/gds_docker/backup_2018_11_20T20_06_53.sql.gz .
            sudo mv backup_2018_11_20T20_06_53.sql.gz /var/www/gfbio_submissions/
    
    1. cd to project root directory
    
            cd /var/www/gfbio_submissions/
    
    1. check CONTAINER_ID of postgres image
    
             docker ps

                CONTAINER ID        IMAGE                            COMMAND                  CREATED             STATUS              PORTS                                                NAMES
                (...)
                21b155a1cd50        gfbio_submissions_postgres       "docker-entrypoint.s…"   4 days ago          Up 4 days           5432/tcp                                             gfbio_submissions_postgres_1_a68a0cc45263
                (...)
    
    1. copy sql dump from local filesystem to container
            
            docker cp backup_2018_11_20T20_06_53.sql.gz 21b155a1cd50:/backups/ 
    
    1. check list of backups
    
            docker-compose -f production.yml run postgres list-backups

                listing available backups
                -------------------------
                (...)
                backup_2018_11_20T20_06_53.sql.gz
                backup_2018_11_20T20_28_44.sql.gz
                (...)
                
    1. load dump
           
           docker-compose -f production.yml run --rm postgres restore backup_2018_11_20T20_06_53.sql.gz

1. Check database consistency

1. Release widget version where API root is pointing to "https://submissions.gfbio.org"
    
    1. enter git root of ena-widget on local computer
    
    1. git flow release start _x.y.z_
    
    1. change API_ROOT in app/containers/TemplateSubmission/api.js
    
    1. create new build
        
            npm run build
            git add build/
    
    1. commit changes 
                
            git commit -an
    
    1. finish release
    
            git flow release finish _x.y.z_
    
    1. checkout latest release an copy sources to server
    
            git checkout _x.y.z_
            scp -r build/ IP_OF_SERVER:/var/www/gfbio_submissions/gfbio_submissions/static/ui/molecular_app
    
    1. enable widget
        
            ssh -l root 141.5.103.171
            cd /var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui
            ln -s molecular_app molecular
            cd /var/www/gds_docker/genomicsdataservices
            supervisorctl stop genomicsdataservices
            docker-compose build
            supervisorctl start genomicsdataservices
            

1. Disable ENA-Widget maintenance message mode

    1. ssh login on current production system
        
            ssh -l root 141.5.103.171
    
    1. stop services
    
            supervisorctl stop genomicsdataservices
      
    1.  cd to static dir containing widget sources
    
            cd /var/www/gds_docker/genomicsdataservices/genomicsdataservices/static/ui/

    1. delete existing link to widget sources
    
            rm molecular
    
    1. create new link to widget with application
    
            ln -s molecular_app/ molecular
    
    1. cd to project root directory
    
            cd /var/www/gds_docker/genomicsdataservices/
            
    1. re-build docker images
    
            docker-compose build
            
    1. start services
        
            supervisorctl start genomicsdataservices
                

      
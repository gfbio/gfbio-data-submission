# SOP Install Broker Agent

## Procedure1. Create directory and copy source code
        mkdir –p /var/www/gds_docker        cd /var/www/gds_docker        git clone https://maweber@colab.mpi-bremen.de/stash/scm/gfbio/genomicsdataservices.git        cd genomicsdataservices/        git checkout develop         #[optional] git pull origin develop1. Generate django secret key   secret key gen : https://gist.github.com/mattseymour/9205591   Copy-paste secret key in docker env file   Encrypt/Decrypt env file?!?!?!?!??!?!?!??!?!   ###((local encrpyt) gpg -vco encrypted.env.gpg .env)   Decrypt encrypted.env.gpg to .env (PASSPHRASE XY)        
        gpg -o .env encrypted.env.gpg1. Let’s Encrypt Setup

        cd compose/nginx/        openssl dhparam -out /var/www/gds_docker/genomicsdataservices/compose/nginx/dhparams.pem 20481. Build and start        docker-compose build        docker-compose up (optional -d)	     # (optional: when compose not in deamon mode) open new terminal

1. Execute migration scripts
	     		 docker-compose run django python manage.py migrate1. Create django superuser, using dialogue        docker-compose run django python manage.py createsuperuser 1. Collect and deploy static files		docker-compose run django python manage.py collectstatic1. Test docker compose installation		docker-compose logs		docker-compose ps		docker-compose run django python manage.py raven test		docker-compose run django python manage.py opbeat test1. Set up broker DB backup

		echo "$DB_BACKUP_PASSPHRASE" > /root/db_backup_passphrase.txt
		chmod 400 /root/db_backup_passphrase.txt
		echo "$BROKER_MPI_OWNCLOUD_CONF" > /root/mpi-owncloud.conf
		chmod 400 /root/mpi-owncloud.conf
		cp genomicsdataservices/system/backup_broker_db.sh /etc/cron.daily/backup_broker_db # install cronjob for DB backup; NB: scripts in the cron.hourly|daily|weekly|monthly folders MUST NOT have extensions
		
##Comments
`"$DB_BACKUP_PASSPHRASE"` and `"$BROKER_MPI_OWNCLOUD_CONF"` are documented separately on paper and in Ivo's KeePassX.
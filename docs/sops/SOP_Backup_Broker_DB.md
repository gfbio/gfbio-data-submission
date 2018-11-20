# SOP Backup Broker Agent Database
## Procedure  
1. Define varibales        COMPOSE_FILE="/var/www/gds_docker/genomicsdataservices/docker-compose.yml"
        LOCAL_BACKUP_DIR="/var/www/gds_docker/backups"
        REMOTE_BACKUP_URL="https://owncloud.mpi-bremen.de/remote.php/webdav/broker_db_backup/" #NB: trailing slash is MANDATORY!!!
        CURL_CONF="/root/mpi-owncloud.conf"
        PASSPHRASE_FILE="/root/db_backup_passphrase.txt"  1. Create backup	Adapted from http://cookiecutter-django.readthedocs.io/en/latest/docker-postgres-backups.html    	docker-compose –f "$COMPOSE_FILE" run postgres backup    	#[OPTIONAL] docker-compose -f "$COMPOSE_FILE" run postgres list-backups    	#[OPTIONAL] docker-compose –f "$COMPOSE_FILE" ps -q postgres #get id of container for this service    	POSTGRES_CONTAINER_ID=$(docker-compose –f "$COMPOSE_FILE" ps -q postgres)    	docker cp "$POSTGRES_CONTAINER_ID":/backups /var/www/gds_docker   The last line copies the whole folder from the container to the host OS, i.e. all backup files will be overwritten every time.
   1. Create md5 checksum and encrypt backup file
	Adapted from https://wiki.openssl.org/index.php/Enc

	    LATEST_BACKUP=$(find "${LOCAL_BACKUP_DIR}" -type f -printf '%T+\t%p\n' | sort -r | head -n 1 | cut -f 2)
		LATEST_BACKUP_MD5="${LATEST_BACKUP}.md5"
		md5sum "$LATEST_BACKUP" > "$LATEST_BACKUP_MD5"
		LATEST_BACKUP_ENCRYPTED="${LATEST_BACKUP}.enc"
		openssl enc -e -aes-256-cbc -kfile "$PASSPHRASE_FILE" -in "$LATEST_BACKUP" -out "$LATEST_BACKUP_ENCRYPTED"

1. Create tar archive of backup file and md5 checksum

        LATEST_BACKUP_TAR="${LATEST_BACKUP%.sql.gz}.tar"
        tar -cf "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_MD5"		

1. Transfer backup tar archive to remote server

        curl --digest -K "$CURL_CONF" -T "$LATEST_BACKUP_TAR" "$REMOTE_BACKUP_URL"

1. Clean up

        rm "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_MD5"
        
        
## Comments
This SOP is implemented as a bash script `genomicsdataservices/system/backup_broker_db.sh` and installed as a daily cron in `/etc/cron.daily/`.
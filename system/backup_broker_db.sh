#!/usr/bin/env bash

#Exit if command fails
set -e
#Exit if undeclared variable
set -u
#Get the first error in chained commands
set -o pipefail

COMPOSE_FILE="/var/www/gfbio_submissions/production.yml"
LOCAL_BACKUP_DIR="/var/www/gfbio_submissions/backups"
REMOTE_BACKUP_URL="https://owncloud.mpi-bremen.de/remote.php/webdav/broker_db_backup/" #NB: trailing slash is MANDATORY!!!
CURL_CONF="/root/mpi-owncloud.conf"
PASSPHRASE_FILE="/root/db_backup_passphrase.txt"

docker-compose -f "$COMPOSE_FILE" exec postgres backup
# docker-compose -f "$COMPOSE_FILE" exec postgres backups
POSTGRES_CONTAINER_ID=$(docker-compose -f "$COMPOSE_FILE" ps -q postgres)
docker cp "$POSTGRES_CONTAINER_ID":/backups "${LOCAL_BACKUP_DIR%/backups}" #copies the whole directory, i.e. overwrites previous files...

LATEST_BACKUP=$(find "${LOCAL_BACKUP_DIR}" -type f -printf '%T+\t%p\n' | sort -r | head -n 1 | cut -f 2)
LATEST_BACKUP_MD5="${LATEST_BACKUP}.md5"
md5sum "$LATEST_BACKUP" > "$LATEST_BACKUP_MD5"
LATEST_BACKUP_ENCRYPTED="${LATEST_BACKUP}.enc"
openssl enc -e -aes-256-cbc -kfile "$PASSPHRASE_FILE" -in "$LATEST_BACKUP" -out "$LATEST_BACKUP_ENCRYPTED"
LATEST_BACKUP_TAR="${LATEST_BACKUP%.sql.gz}.tar"
tar -cf "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_MD5"

curl --digest -K "$CURL_CONF" -T "$LATEST_BACKUP_TAR" "$REMOTE_BACKUP_URL"

rm "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_MD5"

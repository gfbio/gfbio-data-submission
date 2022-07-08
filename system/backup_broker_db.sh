#!/usr/bin/env bash

# This script is intended to be executed via a cronjob. currently the configuration is done
# as follows. 'sudo su' to become root, 'crontab -e' to edit crontab, currently containing
#
# PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin
# 33 3 * * * /home/gitlab-runner/submisssion_automatic_backups/backup_broker_db

#Exit if command fails
set -e
#Exit if undeclared variable
set -u
#Get the first error in chained commands
set -o pipefail

# FIXME: needs to be adapted for ci pipeline (* ?)
COMPOSE_FILE="/home/gitlab-runner/builds/fVfCytz7/0/gfbio/submission.gfbio.org/production.yml"
# TODO: may a better location needs to be found
LOCAL_BACKUP_DIR="/home/gitlab-runner/submisssion_automatic_backups"
#REMOTE_BACKUP_URL="https://owncloud.mpi-bremen.de/remote.php/webdav/broker_db_backup/" #NB: trailing slash is MANDATORY!!!
REMOTE_BACKUP_URL="https://owncloud.gwdg.de/public.php/webdav/" #NB: trailing slash is MANDATORY!!!
#CURL_CONF="/root/mpi-owncloud.conf"
PASSPHRASE_FILE="/root/db_backup_passphrase.txt"

docker-compose -f "$COMPOSE_FILE" exec postgres backup
# docker-compose -f "$COMPOSE_FILE" exec postgres backups
POSTGRES_CONTAINER_ID=$(docker-compose -f "$COMPOSE_FILE" ps -q postgres)
docker cp "$POSTGRES_CONTAINER_ID":/backups "${LOCAL_BACKUP_DIR%/backups}" #copies the whole directory, i.e. overwrites previous files...

LATEST_BACKUP=$(find "${LOCAL_BACKUP_DIR}" -type f -printf '%T+\t%p\n' | sort -r | head -n 1 | cut -f 2)

LATEST_BACKUP_MD5="${LATEST_BACKUP}.md5"
md5sum "$LATEST_BACKUP" >"$LATEST_BACKUP_MD5"

LATEST_BACKUP_ENCRYPTED="${LATEST_BACKUP}.enc"
openssl enc -e -aes-256-cbc -kfile "$PASSPHRASE_FILE" -in "$LATEST_BACKUP" -out "$LATEST_BACKUP_ENCRYPTED"

LATEST_BACKUP_TAR="${LATEST_BACKUP%.sql.gz}.tar"
tar -cf "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_MD5"

curl -u cmFYH7ZQoKfroRj: -T "$LATEST_BACKUP_TAR" "$REMOTE_BACKUP_URL"

rm "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_MD5"

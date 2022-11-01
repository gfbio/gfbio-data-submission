#!/usr/bin/env bash

#Exit if command fails
set -e
#Exit if undeclared variable
set -u
#Get the first error in chained commands
set -o pipefail

echo "start"
date

# FIXME: needs to be adapted for ci pipeline (* ?)
COMPOSE_FILE="/home/gitlab-runner/builds/fVfCytz7/0/gfbio/submission.gfbio.org/production.yml"
LOCAL_BACKUP_DIR="/home/gitlab-runner/submisssion_automatic_backups"
REMOTE_BACKUP_URL="https://owncloud.gwdg.de/public.php/webdav/" #NB: trailing slash is MANDATORY!!!
PASSPHRASE_FILE="/root/db_backup_passphrase.txt"

docker-compose -f "$COMPOSE_FILE" exec -T postgres backup
echo " .. past backup"

POSTGRES_CONTAINER_ID=$(docker-compose -f "$COMPOSE_FILE" ps -q postgres)
echo " container id ${POSTGRES_CONTAINER_ID}"

docker cp "$POSTGRES_CONTAINER_ID":/backups "${LOCAL_BACKUP_DIR%/backups}" #copies the whole directory, i.e. overwrites previous files...
echo "... past docker cp"

# TODO: be aware that the original find command failed when piping to head -n 1. Although this worked for months,
#       the current version does not invert sort and uses tail instead of head, which works correctly.
# echo "find command: find ${LOCAL_BACKUP_DIR} -type f -printf '%T+\t%p\n' | sort -r | head -n 1 | cut -f 2"
# echo "... as it is used: $(find "${LOCAL_BACKUP_DIR}" -type f -printf '%T+\t%p\n' | sort -r | head -n 1 | cut -f 2)"
# LATEST_BACKUP=$(find $LOCAL_BACKUP_DIR -type f -printf '%T+\t%p\n' | sort -r | head -n 1 | cut -f 2)

LATEST_BACKUP=$(find $LOCAL_BACKUP_DIR -type f -printf '%T+\t%p\n' | sort | tail -n 1 | cut -f 2)
echo "... latest backup: "
echo $LATEST_BACKUP

LATEST_BACKUP_MD5="${LATEST_BACKUP}.md5"
md5sum "$LATEST_BACKUP" >"$LATEST_BACKUP_MD5"
echo " ... latest backup md5: ${LATEST_BACKUP_MD5}"

LATEST_BACKUP_ENCRYPTED="${LATEST_BACKUP}.enc"
openssl enc -e -aes-256-cbc -kfile "$PASSPHRASE_FILE" -in "$LATEST_BACKUP" -out "$LATEST_BACKUP_ENCRYPTED"
echo "... encrypted: ${LATEST_BACKUP_ENCRYPTED}"

LATEST_BACKUP_TAR="${LATEST_BACKUP%.sql.gz}.tar"
tar -cf "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_MD5"
echo "... tarfile: ${LATEST_BACKUP_TAR}"

echo "... before curl ${LATEST_BACKUP_TAR} ${REMOTE_BACKUP_URL}"
curl -u cmFYH7ZQoKfroRj: -T "$LATEST_BACKUP_TAR" "$REMOTE_BACKUP_URL"
echo "... after curl, delete files now"

rm "$LATEST_BACKUP_ENCRYPTED" "$LATEST_BACKUP_TAR" "$LATEST_BACKUP_MD5"



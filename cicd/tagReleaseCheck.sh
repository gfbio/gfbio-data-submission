#!/usr/bin/env bash

# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# get commit SHA
COMMIT_SHA=`git rev-parse HEAD`

# check if commit belongs only to master
IS_MASTER=$(PRIVATE_TOKEN=${PRIVATE_TOKEN} COMMIT_SHA=${COMMIT_SHA} CI_PROJECT_ID=${CI_PROJECT_ID} ./cicd/tagMasterCheck.py)

if [ ${IS_MASTER} -eq "1" ]; then
  # build
  rsync -a /home/gitlab-runner/.envs .
  cd userinterface && npm i && npm run collect-ci
  cd ../
  docker-compose -f production.yml build

  # update
  docker-compose -f production.yml up -d postgres
  docker-compose -f production.yml run --rm postgres backup
  docker-compose -f production.yml run --rm django python manage.py migrate
  docker-compose -f production.yml down
  docker-compose -f production.yml up -d
  exit 0
fi

if [ ${IS_MASTER} -eq "2" ]; then
  echo "Commit not found"
  exit 0
fi

echo "Tag found in multiple branches."


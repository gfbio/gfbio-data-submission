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
  sed -i "s/VERSION =.*/VERSION ='$(git describe --tags | egrep -o '[0-9]+\.[0-9]+\.[0-9]+')'/g" config/settings/base.py
  docker-compose -f production.yml build

  # update
  docker-compose -f production.yml up -d postgres
  docker-compose -f production.yml run --rm postgres backup
  docker-compose -f production.yml run --rm django python manage.py migrate
  docker-compose -f production.yml down
  sed -i "s/tag: 'GFBio Django'/tag: 'GFBio Django v$(git describe --tags | egrep -o '[0-9]+\.[0-9]+\.[0-9]+')'/g" production.yml
  docker-compose -f production.yml up -d
  exit 0
fi

echo $IS_MASTER


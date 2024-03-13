#!/usr/bin/env bash

# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# get commit SHA
COMMIT_SHA=`git rev-parse HEAD`

# check if commit belongs to production
IS_PRODUCTION=$(PRIVATE_TOKEN=${PRIVATE_TOKEN} COMMIT_SHA=${COMMIT_SHA} CI_PROJECT_ID=${CI_PROJECT_ID} ./cicd/tagProductionBranchCheck.py)

if [ ${IS_PRODUCTION} -eq "1" ]; then
  # load nvm
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
  # build
  rsync -a /home/gitlab-runner/.envs .
  nvm use 8
  cd userinterface && npm i && npm run collect-ci
  cd ../
  nvm use default
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

echo $IS_PRODUCTION


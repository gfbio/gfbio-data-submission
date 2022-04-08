#!/usr/bin/env bash
# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# get issue id from branch name
IFS='-' read -ra ISSUE_SPLIT <<< "${CI_COMMIT_REF_NAME}"
IFS=';'
ISSUE_ID=${ISSUE_SPLIT[0]}

ISSUE_INFO=$(curl --silent "https://gitlab.gwdg.de//api/v4/projects/${CI_PROJECT_ID}/issues?iids[]=${ISSUE_ID}" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" |  python3 -c "import sys, json; print(json.load(sys.stdin)[0])")
ISSUE_LABELS_ARR=$(python3 -c "print(${ISSUE_INFO}['labels'])")
IS_WEBTEST=$(python3 -c "print(1 if 'web-test' in ${ISSUE_LABELS_ARR} else 0)")

if [ "$IS_WEBTEST" -eq "1" ]; then
    # load nvm
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
    # script
    rm -r .envs && cp -r /home/gitlab-runner/.gfbio_envs/ .envs
    docker stack rm "$ISSUE_ID" || true
    while [[ $(docker ps | grep -c "$ISSUE_ID") -gt 0 ]]; do sleep 1; done
    nvm use 8
    cd userinterface && npm i && npm run collect-ci
    cd ../
    nvm use default
    cp gfbio_submissions/templates/account/webtest_login.html gfbio_submissions/templates/account/login.html
    sed -i s/BRANCH/$CI_COMMIT_REF_NAME/g cicd/production.yml
    sed -i s/ISSUE_ID/$ISSUE_ID/g cicd/production.yml
    sed -i "s/VERSION =.*/VERSION ='$(git describe --tags | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+')'/g" config/settings/base.py
    sed -i s/DJANGO_ALLOWED_HOSTS=.*/DJANGO_ALLOWED_HOSTS=\.submissions\.gfbio\.dev/g .envs/.production/.django
    sed -i s/HOST_URL_ROOT=.*/HOST_URL_ROOT=https:\/\/$CI_COMMIT_REF_NAME\.submissions\.gfbio\.dev/g .envs/.production/.django
    sed -i 's/DJANGO_ADMIN_URL=.*\//DJANGO_ADMIN_URL='"$ADMIN_URL"'/g' .envs/.production/.django
    sed -i s/EMDATE/$(date +%Y-%m-%d -d "+ 365 days")/g cicd/test_data.json
    docker-compose -f cicd/production.yml build
    # create docker volume
    VOLUME_PATH=/home/gitlab-runner/volumes/gfbio-"$ISSUE_ID"
    mkdir -p "$VOLUME_PATH"
    docker volume create --name gfbio-"$ISSUE_ID" --opt type=none --opt device="$VOLUME_PATH" --opt o=bind
    # start stack
    ADMIN_NICKNAME=${ADMIN_NICKNAME} ADMIN_EMAIL=${ADMIN_EMAIL} ADMIN_PASSWORD=${ADMIN_PASSWORD} docker stack deploy -c cicd/production.yml "$ISSUE_ID"
    exit 0
fi

echo "No web-test label found, skipping web-test creation."

#!/usr/bin/env bash
IFS='-' read -ra BRANCH_ARR <<< "$CI_COMMIT_BRANCH""
ISSUE_NUMBER="issue-${BRANCH_ARR[1]}"
BRANCH_RUNNING=$(docker stack ls | grep issue-$ISSUE_NUMBER | head -1)

if [ -z "$BRANCH_RUNNING" ]
  then
    echo "Deploying docker stack for issue-$ISSUE_NUMBER web test"
    docker stack deploy -c cicd/production.yml issue-$ISSUE_NUMBER
  else
    echo "Restarting dcoker stack"
    docker stack rm issue-$ISSUE_NAME
    docker stack deploy -c cicd/production.yml issue-$ISSUE_NAME
fi


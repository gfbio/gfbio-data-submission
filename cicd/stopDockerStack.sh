#!/usr/bin/env bash

regex="Merge branch \'([0-9]+-.+)\' into"
[[ $CI_COMMIT_MESSAGE =~ $regex  ]]
if [[ ${#BASH_REMATCH[@]} < 2 ]]; then
  echo "issue branch not found"
  echo "INFO: $CI_COMMIT_MESSAGE"
  exit 0
fi

IFS='-' read -ra BRANCH_ARR <<< "${BASH_REMATCH[1]}"
ISSUE_NUMBER="${BRANCH_ARR[1]}"
BRANCH_RUNNING=$(docker stack ls | grep issue-$ISSUE_NUMBER | head -1)

if [ -z "$BRANCH_RUNNING" ]
  then
    echo "Docker stack not running"
  else
    docker stack rm issue-$ISSUE_NUMBER
    echo "Docker stack for issue-$ISSUE_NUMBER removed"
fi


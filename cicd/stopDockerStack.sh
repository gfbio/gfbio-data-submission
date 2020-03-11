#!/usr/bin/env bash

regex="Merge branch \'([0-9]+-.+)\' into \'master\'"
[[ $CI_COMMIT_MESSAGE =~ $regex  ]]
if [[ ${#BASH_REMATCH[@]} < 2 ]]; then
  echo "issue branch not found"
  echo "INFO: $CI_COMMIT_MESSAGE"
  exit 0
fi

STACK_NAME="${BASH_REMATCH[1]}"
docker stack rm $STACK_NAME || true


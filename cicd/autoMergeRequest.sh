#!/usr/bin/env bash
# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# Look which is the default branch
TARGET_BRANCH=`curl --silent "${HOST}${CI_PROJECT_ID}" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" | python3 -c "import sys, json; print(json.load(sys.stdin)['default_branch'])"`;

IFS='-' read -ra ISSUE_SPLIT <<< "${CI_COMMIT_REF_NAME}"
IFS=';'
ISSUE_ID=${ISSUE_SPLIT[0]}

ISSUE_INFO=`curl --silent "https://gitlab.gwdg.de//api/v4/projects/10414/issues?iids[]=${ISSUE_ID}" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" |  python3 -c "import sys, json; print(json.load(sys.stdin)[0])"`
ISSUE_LABELS=`python3 -c "import json; l=${ISSUE_INFO}['labels']; print(','.join(l))"`
ISSUE_MILESTONE=`python3 -c "import json; print(${ISSUE_INFO}['milestone']['id'])"`

# The description of our new MR, we want to remove the branch after the MR has
# been closed
BODY="{
    \"id\": ${CI_PROJECT_ID},
    \"source_branch\": \"${CI_COMMIT_REF_NAME}\",
    \"target_branch\": \"${TARGET_BRANCH}\",
    \"remove_source_branch\": true,
    \"labels\": \"${ISSUE_LABELS}\",
    \"milestone_id\": \"${ISSUE_MILESTONE}\",
    \"title\": \"WIP: ${CI_COMMIT_REF_NAME}\",
    \"assignee_ids\": [3832,3834],
    \"description\": \"Closes: #${ISSUE_ID}\"
}";

# Require a list of all the merge request and take a look if there is already
# one with the same source branch
LISTMR=`curl --silent "${HOST}${CI_PROJECT_ID}/merge_requests?state=opened" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}"`;
COUNTBRANCHES=`echo ${LISTMR} | grep -o "\"source_branch\":\"${CI_COMMIT_REF_NAME}\"" | wc -l`;

# No MR found, let's create a new one
if [ ${COUNTBRANCHES} -eq "0" ]; then
    curl -X POST "${HOST}${CI_PROJECT_ID}/merge_requests" \
        --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" \
        --header "Content-Type: application/json" \
        --data "${BODY}";

    echo "Opened a new merge request: WIP: ${CI_COMMIT_REF_NAME} and assigned to you";
    exit;
fi

echo "No new merge request opened";


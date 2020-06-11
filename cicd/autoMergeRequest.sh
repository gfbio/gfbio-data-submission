#!/usr/bin/env bash
# Extract the host where the server is running, and add the URL to the APIs
[[ $HOST =~ ^https?://[^/]+ ]] && HOST="${BASH_REMATCH[0]}/api/v4/projects/"

# Look which is the default branch
TARGET_BRANCH=`curl --silent "${HOST}${CI_PROJECT_ID}" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" | python3 -c "import sys, json; print(json.load(sys.stdin)['default_branch'])"`;

# get issue id from branch name
IFS='-' read -ra ISSUE_SPLIT <<< "${CI_COMMIT_REF_NAME}"
IFS=';'
ISSUE_ID=${ISSUE_SPLIT[0]}

# get issue info
ISSUE_INFO=`curl --silent "https://gitlab.gwdg.de//api/v4/projects/${CI_PROJECT_ID}/issues?iids[]=${ISSUE_ID}" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" |  python3 -c "import sys, json; print(json.load(sys.stdin)[0])"`
ISSUE_LABELS_ARR=`python3 -c "print(${ISSUE_INFO}['labels'])"`
ISSUE_LABELS_STR=`python3 -c "print(','.join(${ISSUE_LABELS_ARR}))"`
ISSUE_MILESTONE=`python3 -c "print(${ISSUE_INFO}['milestone']['id'])"`

# get reviewers ids
REVIEWERS_IDS=$(PRIVATE_TOKEN=${PRIVATE_TOKEN} CI_PROJECT_ID=${CI_PROJECT_ID} ./cicd/get_reviewers_ids.py)
CODE_REVIEW_IDS=`python3 -c "import re; arr_pattern = re.compile(r'(\[\d*.*\])\s(\[\d*.*\])\s(\[\d*.*\])'); match = arr_pattern.findall(\"${REVIEWERS_IDS}\"); print(match[0][0] if len(match)>0 else [])"`
FEATURE_REVIEW_IDS=`python3 -c "import re; arr_pattern = re.compile(r'(\[\d*.*\])\s(\[\d*.*\])\s(\[\d*.*\])'); match = arr_pattern.findall(\"${REVIEWERS_IDS}\"); print(match[0][1] if len(match)>0 else [])"`
ALL_REVIEWERS_IDS=`python3 -c "import re; arr_pattern = re.compile(r'(\[\d*.*\])\s(\[\d*.*\])\s(\[\d*.*\])'); match = arr_pattern.findall(\"${REVIEWERS_IDS}\"); print(match[0][2] if len(match)>0 else [])"`

ASSIGNED_USERS=`python3 -c "print(${ALL_REVIEWERS_IDS} if 'web-test' in ${ISSUE_LABELS_ARR} else ${CODE_REVIEW_IDS})"`
IS_WEBTEST=`python3 -c "print(1 if 'web-test' in ${ISSUE_LABELS_ARR} else 0)"`

# The description of our new MR, we want to remove the branch after the MR has
# been closed
BODY="{
    \"id\": ${CI_PROJECT_ID},
    \"source_branch\": \"${CI_COMMIT_REF_NAME}\",
    \"target_branch\": \"${TARGET_BRANCH}\",
    \"remove_source_branch\": true,
    \"labels\": \"${ISSUE_LABELS_STR}\",
    \"milestone_id\": \"${ISSUE_MILESTONE}\",
    \"title\": \"WIP: ${CI_COMMIT_REF_NAME}\",
    \"assignee_ids\": ${ASSIGNED_USERS},
    \"description\": \"Closes: #${ISSUE_ID}\"
}";

# Require a list of all the merge request and take a look if there is already
# one with the same source branch
LISTMR=`curl --silent "${HOST}${CI_PROJECT_ID}/merge_requests?state=opened" --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}"`;
COUNTBRANCHES=`echo ${LISTMR} | grep -o "\"source_branch\":\"${CI_COMMIT_REF_NAME}\"" | wc -l`;

# No MR found, let's create a new one
if [ ${COUNTBRANCHES} -eq "0" ]; then
    MR_ID=`curl -X POST "${HOST}${CI_PROJECT_ID}/merge_requests" \
        --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" \
        --header "Content-Type: application/json" \
	--data "${BODY}" | python3 -c "import sys, json; print(json.load(sys.stdin)['iid'])"`;

    # add code reviewers
    RULES_BODY="{
       \"id\": ${CI_PROJECT_ID},
       \"merge_request_iid\": $MR_ID,
       \"name\": \"Code Reviewers\",
       \"approvals_required\": 1,
       \"user_ids\": ${CODE_REVIEW_IDS}
      }";
    curl -X POST "${HOST}${CI_PROJECT_ID}/merge_requests/${MR_ID}/approval_rules" \
      --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" \
      --header "Content-Type: application/json" \
      --data "${RULES_BODY}";

    if [ $IS_WEBTEST -eq "1" ]; then
      echo "Adding approver rules manually"

      # add feature reviewers
      RULES_BODY="{
         \"id\": ${CI_PROJECT_ID},
         \"merge_request_iid\": $MR_ID,
         \"name\": \"Feature Approvers\",
         \"approvals_required\": 1,
         \"user_ids\": ${FEATURE_REVIEW_IDS}
        }";
      curl -X POST "${HOST}${CI_PROJECT_ID}/merge_requests/${MR_ID}/approval_rules" \
        --header "PRIVATE-TOKEN:${PRIVATE_TOKEN}" \
        --header "Content-Type: application/json" \
        --data "${RULES_BODY}";
    fi

    echo "Opened a new merge request: WIP: ${CI_COMMIT_REF_NAME} and assigned to you";
    exit;
fi

echo "No new merge request opened";


#!/usr/bin/env python3
import requests
import os

headers = {'PRIVATE-TOKEN': os.environ['PRIVATE_TOKEN'] }
r = requests.get("https://gitlab.gwdg.de//api/v4/projects/{}/approval_rules".format(os.environ['CI_PROJECT_ID']), headers=headers)

review_ids = []
feature_ids = []
all_ids = []

for group in r.json():
    if group['name'] == 'Code Reviewers':
        for user in group['users']:
            review_ids.append(user['id'])
            all_ids.append(user['id'])
    if group['name'] == 'Feature Approvers':
        for user in group['users']:
            feature_ids.append(user['id'])
            all_ids.append(user['id'])

print(review_ids, feature_ids, all_ids)


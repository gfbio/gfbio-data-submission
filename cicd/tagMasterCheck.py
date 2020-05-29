#!/usr/bin/env python3
import requests
import os

# get commit reference
headers = {'PRIVATE-TOKEN': os.environ['PRIVATE_TOKEN'] }
r = requests.get("https://gitlab.gwdg.de/api/v4/projects/{}/repository/commits/{}/refs".format(os.environ['CI_PROJECT_ID'], os.environ['COMMIT_SHA'), headers=headers)

isMaster = False
branchCount = 0
data = r.json()

for obj in data:
  if obj['type'] == 'branch':
      branchCount += 1
      if obj['name'] == 'master':
          isMaster = True

if isMaster and branchCount == 1:
    print(1)
else:
    print(0)

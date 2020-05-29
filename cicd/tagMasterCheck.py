#!/usr/bin/env python3
import requests
import os
import sys
import subprocess

# get first 8 chars of commit SHA
COMMIT_SHA = subprocess.run(['git', 'rev-parse', 'HEAD'], stdout=subprocess.PIPE).stdout.decode('utf-8')[:8]

# get commit reference
headers = {'PRIVATE-TOKEN': os.environ['PRIVATE_TOKEN'] }
r = requests.get("https://gitlab.gwdg.de/api/v4/projects/{}/repository/commits/{}/refs".format(os.environ['CI_PROJECT_ID'], COMMIT_SHA), headers=headers)

data = r.json()
isMaster = False
allBranches = 'Tag found in: '

if 'message' in data:
    print(data['message'])
    sys.exit(0)

for obj in data:
  if obj['type'] == 'branch':
      allBranches += '{} '.format(obj['name'])
      if obj['name'] == 'master':
          isMaster = True

if isMaster:
    print(1)
else:
    print('Tag not found in master, found in: {}'.format(allBranches))

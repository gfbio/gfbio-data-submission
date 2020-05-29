#!/usr/bin/env python3
import requests
import os
import sys
import subprocess

# get commit SHA
COMMIT_SHA = subprocess.run(['git', 'rev-parse', 'HEAD'], stdout=subprocess.PIPE).stdout.decode('utf-8')[:8]

# get commit reference
headers = {'PRIVATE-TOKEN': os.environ['PRIVATE_TOKEN'] }
r = requests.get("https://gitlab.gwdg.de/api/v4/projects/{}/repository/commits/{}/refs".format(os.environ['CI_PROJECT_ID'], COMMIT_SHA), headers=headers)

isMaster = False
branchCount = 0
data = r.json()

if 'message' in data:
    print(2)
    sys.exit(0)

for obj in data:
  if obj['type'] == 'branch':
      branchCount += 1
      if obj['name'] == 'master':
          isMaster = True

if isMaster and branchCount == 1:
    print(1)
else:
    print(0)

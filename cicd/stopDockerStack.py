import re
import sys
import subprocess

commit_msg = sys.argv[1]
pattern = "Merge branch \'([0-9]+-.+)\' into .+"
branch = re.findall(pattern, commit_msg)

if len(branch) == 0:
    print("COMMIT_MSG: ", commit_msg)
    sys.exit("branch name not found")

issue_id = re.findall("([0-9]+)-.+", branch[0])
if len(issue_id) == 0:
    sys.exit("issueID name not found")

bashCmd = "docker stack rm {}".format(issue_id[0])
process = subprocess.Popen(bashCmd.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = process.communicate()
print("RESULT: ", stdout)
print("ERRORS: ", stderr)

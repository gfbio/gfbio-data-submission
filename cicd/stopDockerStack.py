import re
import sys
import subprocess

commit_msg = sys.argv[1]
pattern = "Merge branch \'([0-9]+-.+)\' into \'master\'"
branch = re.findall(pattern, commit_msg)

if len(branch) == 0:
    print("COMMIT_MSG: ", commit_msg)
    sys.exit("branch name not found")

bashCmd = "docker stack rm {} || true".format(branch[0])
process = subprocess.Popen(bashCmd.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout, stderr = process.communicate()
print(stdout)
if len(stderr) > 0:
    sys.exit(stderr)

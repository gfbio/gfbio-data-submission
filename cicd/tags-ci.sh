#!/bin/bash
tag_commit="$(git log -1 $CI_COMMIT_TAG | head -n 1 | awk '{print $2}')"

# get all branches and remove * from the output
branches="$(git branch --contains $tag_commit | sed 's/\*//g')"

# count all branches and see if commit is in master branch
counter=0
master=false
for branch in $branches
do
   ((counter=counter+1))
   if [ $branch == "master" ]; then
	master=true
   fi
done

if [ $counter -ne "1" ] || [ $master = false ]; then
  echo "Tag found in multiple branches"
  echo -e "Branches list:\n $branches"
  exit 1
fi

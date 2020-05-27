#!/bin/bash
latest_commit="$(git describe)"

# get all branches and remove * from the output
branches="$(git branch --contains $latest_commit | sed 's/\*//g')"

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

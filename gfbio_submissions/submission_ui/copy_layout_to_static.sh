#!/bin/bash
cd ./layout_playground/ &&
gulp &&
cp -r vendor/ ../../static/ &&
# cp -r images ../gfbio_services/static/ &&
cp css/project.min.css ../../static/css/project.css  &&
cp js/project.min.js ../../static/js/project.js &&
cd ../../../ &&
echo yes | docker-compose -f local.yml run --rm django python manage.py collectstatic


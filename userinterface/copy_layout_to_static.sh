#!/bin/bash
cd ./layout_playground/ &&
gulp && cp -r vendor/ ../../gfbio_submissions/static/ &&
# cp -r images ../../gfbio_submissions/static/ &&
cp css/project.min.css ../../gfbio_submissions/static/css/project.css  &&
cp js/project.min.js ../../gfbio_submissions/static/js/project.js &&
cd ../../ && echo yes | docker-compose -f local.yml run --rm django python manage.py collectstatic


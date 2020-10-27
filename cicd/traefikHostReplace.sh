#!/bin/bash
sed -i 's/rule:.*/rule: "Host(`stage.submissions.gfbio.org`)"/g' compose/production/traefik/traefik.yml

#!/bin/bash
sed -i 's/rule:.*/rule: "Host(`c103-171.cloud.gwdg.de`)"/g' compose/production/traefik/traefik.yml

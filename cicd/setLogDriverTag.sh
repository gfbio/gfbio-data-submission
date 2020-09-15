#!/usr/bin/env bash
sed -i "s/tag: 'GFBio Django'/tag: 'GFBio Django v$(git describe --tags | egrep -o '[0-9]+\.[0-9]+\.?[0-9]{0,}')'/g" production.yml

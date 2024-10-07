#!/bin/bash

sed -i -e 's/us.archive.ubuntu.com/archive.ubuntu.com/g' /etc/apt/sources.list
apt-get update
apt-get install -y curl
curl -LfsSo /tmp/openjdk.tar.gz https://github.com/AdoptOpenJDK/openjdk17-binaries/archive/refs/tags/jdk-2021-05-07-13-31.tar.gz
mkdir -p /opt/java/openjdk
cd /opt/java/openjdk
tar -xf /tmp/openjdk.tar.gz --strip-components=1
rm -rf /tmp/openjdk.tar.gz
apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false
rm -rf /var/lib/apt/lists/*

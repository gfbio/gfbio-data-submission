#!/usr/bin/env bash

set -o errexit
set -o pipefail
set -o nounset


celery -A gfbio_submissions.taskapp worker -l INFO

# -*- coding: utf-8 -*-
import hashlib
import os
from functools import partial


def submission_upload_path(instance, filename):
    return '{0}{1}{2}'.format(instance.submission.broker_submission_id,
                              os.path.sep, filename)


def hash_file(file_field):
    hasher = hashlib.md5()
    for chunk in file_field.chunks():
        hasher.update(chunk)

    return hasher.hexdigest()


# TODO: remove once upload consolidation is finished
# TODO: needs clean/fresh migration history. intial 001 migration expects this
#  for primary data model
def submission_primary_data_file_upload_path(instance, filename):
    return '{0}{1}primary_data_files{1}{2}'.format(
        instance.submission.broker_submission_id,
        os.path.sep,
        filename)

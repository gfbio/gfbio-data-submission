# -*- coding: utf-8 -*-
import os


# TODO: remove this ..., but is part of initial migration
def submission_rest_upload_path(instance, filename):
    return '{0}/{1}'.format(instance.broker_submission_id, filename)


def submission_file_upload_path(instance, filename):
    return '{0}{1}{2}'.format(instance.submission.broker_submission_id,
                               os.path.sep, filename)


def submission_primary_data_file_upload_path(instance, filename):
    return '{0}{1}primary_data_files{1}{2}'.format(
        instance.submission.broker_submission_id,
        os.path.sep,
        filename)

# -*- coding: utf-8 -*-
import hashlib
import os
from gfbio_submissions.brokerage.configuration.settings import \
    JIRA_FALLBACK_USERNAME, JIRA_FALLBACK_EMAIL


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


def get_embargo_from_request(request):
    # get incoming embargo
    import datetime
    new_embargo = None
    if request.data and 'embargo' in request.data:
        try:
            embargo_date_format = "%Y-%m-%d"
            new_embargo = datetime.datetime.strptime(request.data['embargo'],
                                                     embargo_date_format).date()
        except ValueError:
            new_embargo = None
    return new_embargo

def get_reporter_from_request(request):
    # get incoming reporter
    #are the submission terms, not jira terms:
    new_reporter_ret = {
         'jira_user_name': JIRA_FALLBACK_USERNAME,
        'email': JIRA_FALLBACK_EMAIL,
        'full_name': ''
    }

    if request.data and 'reporter' in request.data:
        try:
            # new_reporter_ret = new_reporter
            new_reporter_ret['jira_user_name'] = request.data['reporter']['name']
            new_reporter_ret['email'] = request.data['reporter']['emailAddress']
            new_reporter_ret['full_name'] = request.data['reporter']['key']   # displayName exists also!

        except ValueError:
            new_reporter_ret = None
    return new_reporter_ret

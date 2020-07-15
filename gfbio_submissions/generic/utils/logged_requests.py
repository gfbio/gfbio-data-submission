# -*- coding: utf-8 -*-
from uuid import uuid4

import requests

from ..models import RequestLog


def post(url, data=None, json=None, submission=None, return_log_id=False,
         request_id=uuid4(),
         **kwargs):
    response = requests.post(
        url=url,
        data=data,
        json=json,
        **kwargs,
    )
    user = None
    submission_id = None
    incoming = None
    data = data or ''  # TODO: files ? json ?
    files = kwargs.get('files', '')
    json = json or {}
    if submission:
        user = submission.user
        submission_id = submission.broker_submission_id
        try:
            incoming = RequestLog.objects.filter(
                submission_id=submission.broker_submission_id).filter(
                type=RequestLog.INCOMING).latest('created')
        except RequestLog.DoesNotExist:
            pass

    log = RequestLog.objects.create(
        type=RequestLog.OUTGOING,
        method=RequestLog.POST,
        request_id=request_id,
        url=url,
        data=data,
        files=files,
        json=json,
        user=user,
        submission_id=submission_id,
        response_status=response.status_code,
        response_content=response.content,
        triggered_by=incoming,
        request_details={
            'response_headers': str(response.headers or '')
        }
    )
    if return_log_id:
        return response, log.request_id

    return response


def get(url, params=None, submission=None, return_log_id=False, **kwargs):
    response = requests.get(url=url, params=params, **kwargs)

    user = None
    submission_id = None
    if submission:
        user = submission.user
        submission_id = submission.broker_submission_id

    log = RequestLog.objects.create(
        type=RequestLog.OUTGOING,
        method=RequestLog.GET,
        url=url,
        user=user,
        submission_id=submission_id,
        response_status=response.status_code,
        response_content=response.content,
        request_details={
            'response_headers': str(response.headers or '')
        }
    )
    if return_log_id:
        return response, log.request_id
    return response

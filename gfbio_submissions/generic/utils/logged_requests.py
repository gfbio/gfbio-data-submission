# -*- coding: utf-8 -*-
import logging
from uuid import uuid4

import requests

from ..models.request_log import RequestLog

logger = logging.getLogger(__name__)


def post(url, data=None, json=None, submission=None, return_log_id=False, request_id=uuid4(), **kwargs):
    if len(RequestLog.objects.filter(request_id=request_id)) > 0:
        logger.info(
            "logged_requests.py | post | UUID={0} already exists | submission={1}".format(
                request_id, submission.broker_submission_id
            )
        )
        request_id = uuid4()

    data = data or ""
    log = RequestLog.objects.create(
        type=RequestLog.OUTGOING,
        method=RequestLog.POST,
        request_id=request_id,
        url=url,
        data=data,
        user=submission.user if submission else None,
        submission_id=submission.broker_submission_id if submission else None,
        request_details={"initial_report": True},
    )

    response = requests.post(
        url=url,
        data=data,
        json=json,
        **kwargs,
    )
    incoming = None
    files = kwargs.get("files", "")
    json = json or {}
    if submission:
        try:
            incoming = (
                RequestLog.objects.filter(submission_id=submission.broker_submission_id)
                .filter(type=RequestLog.INCOMING)
                .latest("created")
            )
        except RequestLog.DoesNotExist:
            pass

    RequestLog.objects.filter(pk=log.pk).update(
        request_id=request_id,
        files=files,
        json=json,
        response_status=response.status_code,
        response_content=response.content,
        triggered_by=incoming,
        request_details={
            "initial_report": False,
            "response_headers": str(response.headers or ""),
        },
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
        request_details={"response_headers": str(response.headers or "")},
    )
    if return_log_id:
        return response, log.request_id
    return response

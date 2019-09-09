# -*- coding: utf-8 -*-
import logging

logger = logging.getLogger(__name__)


class TransferError(Exception):
    pass


class TransferClientError(TransferError):
    pass


class TransferServerError(TransferError):
    pass


class TransferUnknownError(TransferError):
    pass


class TransferInvalidSubmission(TransferError):
    pass


class TransferInternalError(TransferError):
    pass


def raise_response_exceptions(response):

    error = None
    if not response.ok:
        if 400 <= response.status_code < 500:
            error = TransferClientError(
                response.status_code,
                response.content
            )
        elif 500 <= response.status_code < 600:
            error = TransferServerError(response.status_code)
        else:
            error = TransferUnknownError(response.status_code)
        if error:
            logger.error(
                msg='SubmissionTransferError: '
                    'Aborted with status_code {0} '
                    'due to error {1}'.format(response.status_code,
                                              error))
            raise error

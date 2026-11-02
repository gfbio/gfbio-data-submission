# -*- coding: utf-8 -*-
import logging

logger = logging.getLogger(__name__)


class NoTicketAvailableError(Exception):
    pass


def raise_no_ticket_exception(no_of_helpdesk_tickets):
    if no_of_helpdesk_tickets == 0:
        raise NoTicketAvailableError


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


class ChecklistMappingBlocked(TransferInvalidSubmission):
    """Sample XML has an unknown ENA checklist, so metadata must not be posted."""

    def __init__(self, submission_id):
        self.submission_id = submission_id
        super().__init__(
            "ENA checklist mapping failed for submission {0}; metadata was not sent".format(submission_id)
        )


class InvalidCenterName(TransferInvalidSubmission):
    def __init__(self, submission_id, reason):
        self.submission_id = submission_id
        self.reason = reason
        super().__init__(str(self))

    def __str__(self):
        return "Invalid ENA center_name for submission {0}: {1}".format(
            self.submission_id, self.reason
        )


class TransferInternalError(TransferError):
    pass


def raise_response_exceptions(response):
    error = None
    if not response.ok:
        if 400 <= response.status_code < 500:
            error = TransferClientError(response.status_code, response.content)
        elif 500 <= response.status_code < 600:
            error = TransferServerError(response.status_code)
        else:
            error = TransferUnknownError(response.status_code)
        if error:
            logger.error(
                msg="SubmissionTransferError: "
                    "Aborted with status_code {0} "
                    "due to error {1}".format(response.status_code, error)
            )
            raise error

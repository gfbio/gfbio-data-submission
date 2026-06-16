# -*- coding: utf-8 -*-
import logging

import celery

from config.celery_app import app

from ..configuration.settings import SUBMISSION_MAX_RETRIES, SUBMISSION_RETRY_DELAY
from ..exceptions.transfer_exceptions import TransferClientError, TransferServerError
from ..models.task_progress_report import TaskProgressReport

logger = logging.getLogger(__name__)


# abstract base class for tasks ------------------------------------------------
class SubmissionTask(celery.Task):
    abstract = True

    # TODO: consider a report for every def here OR refactor taskreport to
    #  keep track in one report. Keep in mind to resume chains from a certain
    #  point, add a DB clean up task to remove from database
    # @abstractmethod
    # def __init__(self):
    #     super(SubmissionTask, self).__init__()

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        logger.info("tasks.py | SubmissionTask | on_retry | task_id={0} | " "name={1}".format(task_id, self.name))
        # TODO: capture this idea of reporting to sentry
        # sentrycli.captureException(exc)
        TaskProgressReport.objects.update_report_on_exception(
            "RETRY", exc, task_id, args, kwargs, einfo, task_name=self.name
        )
        super(SubmissionTask, self).on_retry(exc, task_id, args, kwargs, einfo)

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.info(
            "tasks.py | SubmissionTask | on_failure | task_id={0} | "
            "name={1}| args={2} | kwargs={3} | einfo={4} | "
            "".format(task_id, self.name, args, kwargs, einfo)
        )
        TaskProgressReport.objects.update_report_on_exception(
            "FAILURE", exc, task_id, args, kwargs, einfo, task_name=self.name
        )
        super(SubmissionTask, self).on_failure(exc, task_id, args, kwargs, einfo)

    def on_success(self, retval, task_id, args, kwargs):
        logger.info(
            "tasks.py | SubmissionTask | on_success | task_id={0} | "
            "name={1} | retval={2}".format(task_id, self.name, retval)
        )
        TaskProgressReport.objects.update_report_on_success(retval, task_id, args, kwargs, task_name=self.name)
        super(SubmissionTask, self).on_success(retval, task_id, args, kwargs)

    def after_return(self, status, retval, task_id, args, kwargs, einfo):
        logger.info(
            "tasks.py | SubmissionTask | after_return | task_id={0} | "
            "name={1} | args={2} | kwargs={3} | einfo={4} | "
            "retval={5}".format(task_id, self.name, args, kwargs, einfo, retval)
        )
        TaskProgressReport.objects.update_report_after_return(status, task_id, task_name=self.name)
        super(SubmissionTask, self).after_return(status, retval, task_id, args, kwargs, einfo)


# decorator factory ------------------------------------------------------------
def submission_task(name, **overrides):
    """Register a submission task with the standard Celery retry preamble.

    Returns the ``app.task`` decorator pre-configured with ``SubmissionTask`` as
    the base, ``bind=True`` and the shared auto-retry settings. ``name`` is the
    registered Celery task name and must stay stable for queue routing. Any
    ``overrides`` (e.g. ``queue=...``) are forwarded to ``app.task`` and take
    precedence, so intentional per-task deviations remain explicit.
    """
    options = {
        "base": SubmissionTask,
        "bind": True,
        "name": name,
        "autoretry_for": (TransferServerError, TransferClientError),
        "retry_kwargs": {"max_retries": SUBMISSION_MAX_RETRIES},
        "retry_backoff": SUBMISSION_RETRY_DELAY,
        "retry_jitter": True,
    }
    options.update(overrides)
    return app.task(**options)

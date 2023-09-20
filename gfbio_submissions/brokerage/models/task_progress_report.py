# -*- coding: utf-8 -*-
import uuid

from django.db import models
from model_utils.models import TimeStampedModel

# from gfbio_submissions.brokerage.managers import TaskProgressReportManager
from .submission import Submission
from ..managers.task_progress_report_manager import TaskProgressReportManager


class TaskProgressReport(TimeStampedModel):
    RUNNING = 'RUNNING'
    CANCELLED = 'CANCELLED'
    submission = models.ForeignKey(Submission, null=True, blank=True,
                                   help_text='Submission this Task is working on',
                                   on_delete=models.SET_NULL)
    task_name = models.CharField(max_length=128,
                                 help_text='Name of Task, as registered in celery')
    task_id = models.UUIDField(default=uuid.uuid4, primary_key=True,
                               help_text='UUID identifying this task. Will be '
                                         'provided via the Task itself, but '
                                         'defaults to randon uuid')
    status = models.CharField(max_length=16, default=RUNNING,
                              help_text='Current State of Task')

    task_return_value = models.TextField(default='')
    task_exception = models.TextField(default='')
    task_exception_info = models.TextField(default='')
    task_args = models.TextField(default='')
    task_kwargs = models.TextField(default='')

    objects = TaskProgressReportManager()

    def __str__(self):
        if len(self.task_name):
            return '{0}'.format(self.task_name)
        else:
            return 'unnamed_task'

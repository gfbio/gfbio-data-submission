# -*- coding: utf-8 -*-
import json

from django.db import models, transaction


class TaskProgressReportManager(models.Manager):
    @transaction.atomic()
    def create_initial_report(self, submission, task):
        report, created = self.update_or_create(
            task_id=task.request.id,
            defaults={
                "submission": submission,
                "task_name": task.name,
                "task_id": task.request.id,
            },
        )
        return report, created

    @transaction.atomic()
    def update_report_after_return(self, status, task_id, task_name="no_name_provided"):
        report, created = self.update_or_create(
            task_id=task_id,
            defaults={
                "task_id": task_id,
                "status": status,
                "task_name": task_name,
            },
        )
        return report, created

    @transaction.atomic()
    def update_report_on_success(self, retval, task_id, args, kwargs, task_name="no_name_provided"):
        report, created = self.update_or_create(
            task_id=task_id,
            defaults={
                "task_id": task_id,
                "status": "SUCCESS",
                "task_name": task_name,
                "task_args": "{}".format(args),
                "task_kwargs": json.dumps(kwargs),
                "task_return_value": "{}".format(retval),
            },
        )
        return report, created

    @transaction.atomic()
    def update_report_on_exception(self, status, exc, task_id, args, kwargs, einfo, task_name="no_name_provided"):
        report, created = self.update_or_create(
            task_id=task_id,
            defaults={
                "task_id": task_id,
                "status": status,
                "task_name": task_name,
                "task_exception": "{}".format(exc),
                "task_exception_info": "{}".format(einfo),
                "task_args": "{}".format(args),
                "task_kwargs": json.dumps(kwargs),
            },
        )
        return report, created

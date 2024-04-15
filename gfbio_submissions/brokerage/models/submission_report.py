# -*- coding: utf-8 -*-

from django.db import models
from model_utils.models import TimeStampedModel
from config.settings.base import AUTH_USER_MODEL
from .submission import Submission

# TODO: an error occurs for models added after the refactorings to file-per-model:
#   no migration will be created intially. e.g. model below
#   - makemigation works for changes to models already registered
#   - makemigrations work if a new model definition is add to a file with a registered model, e.g. submissions.py
#   - you need to add a import statement to models/__init.py
#    compare https://stackoverflow.com/questions/40061555/using-other-file-names-than-models-py-for-django-models
class SubmissionReport(TimeStampedModel):
    ERROR = "ERROR"
    INFO = "INFO"
    DEBUG = "DEBUG"

    CATEGORIES = [
        (ERROR, ERROR),
        (INFO, INFO),
        (DEBUG, DEBUG)
    ]

    submission = models.ForeignKey(
        Submission,
        null=False,
        blank=False,
        help_text="Submission associated with this Report.",
        on_delete=models.CASCADE,
    )
    report = models.CharField(max_length=512)
    report_category = models.CharField(max_length=6, choices=CATEGORIES)

    def __str__(self):
        return "{}_{}".format(self.report_category, self.submission.broker_submission_id)

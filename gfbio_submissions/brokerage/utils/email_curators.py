# -*- coding: utf-8 -*-
import logging

from django.contrib.auth import get_user_model
from django.core.mail import send_mail

from ..configuration.settings import CHECKLIST_ACCESSION_MAPPING

logger = logging.getLogger(__name__)
User = get_user_model()
from django.conf import settings


def email_curators(subject, message):
    curators = User.objects.filter(groups__name="Curators")
    if len(curators) > 0:
        curators_emails = [curator.email for curator in curators]
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.SERVER_EMAIL,
            recipient_list=curators_emails,
            fail_silently=False,
        )


def send_checklist_mapping_error_notification(submission_id, samples_with_errors):
    logger.info("email_curators.py | send_checklist_mapping_error_notification | len(samples_with_errors)={}".format(
        len(samples_with_errors)))
    # TODO: send formated list of errors containign sample tite alias value and valid mapping list
    errors = """"""
    for s in samples_with_errors:
        title, alias, term = s
        errors += f"""\nsample title: {title} | sample alias: {alias} | trying to map: {term} |"""
    errors += """\n"""
    message = """
    There are error(s) when mapping MiXS environmental package to ENA checklist.
    Compare submission with database-id: {0}.
    Errors:
    {1}
    Currently available mappings:
    {2}
    """.format(submission_id, errors, CHECKLIST_ACCESSION_MAPPING)
    email_curators(subject="Errors in mapping ENA-Checklist", message=message)

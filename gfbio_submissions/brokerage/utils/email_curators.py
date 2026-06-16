# -*- coding: utf-8 -*-
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import mail_admins, send_mail

from ..configuration.settings import CHECKLIST_ACCESSION_MAPPING

logger = logging.getLogger(__name__)
User = get_user_model()

CURATORS_GROUP_NAME = "Curators"


def get_curator_emails():
    return list(
        User.objects.filter(groups__name=CURATORS_GROUP_NAME)
        .exclude(email="")
        .values_list("email", flat=True)
    )


def _prefixed_subject(subject):
    """Mirror Django mail_admins() subject prefixing (uses EMAIL_SUBJECT_PREFIX)."""
    return "{0}{1}".format(settings.EMAIL_SUBJECT_PREFIX, subject)


def mail_curators(subject, message, fallback_to_admins=True):
    """Send email to Curators group; fall back to mail_admins if no recipients exist."""
    curator_emails = get_curator_emails()
    if curator_emails:
        send_mail(
            subject=_prefixed_subject(subject),
            message=message,
            from_email=settings.SERVER_EMAIL,
            recipient_list=curator_emails,
            fail_silently=False,
        )
        logger.info(
            "email_curators.py | mail_curators | sent to {0} curator(s) | subject={1}".format(
                len(curator_emails), subject
            )
        )
        return True

    logger.warning(
        "email_curators.py | mail_curators | no curators found | subject={0}".format(subject)
    )
    if fallback_to_admins:
        mail_admins(subject=subject, message=message)
        return False

    return False


def email_curators(subject, message):
    mail_curators(subject=subject, message=message)


def send_checklist_mapping_error_notification(submission_id, samples_with_errors):
    logger.info(
        "email_curators.py | send_checklist_mapping_error_notification | len(samples_with_errors)={}".format(
            len(samples_with_errors)
        )
    )
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

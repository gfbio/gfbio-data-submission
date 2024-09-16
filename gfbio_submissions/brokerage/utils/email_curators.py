# -*- coding: utf-8 -*-
import logging

from django.contrib.auth import get_user_model
from django.core.mail import send_mail

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


def send_checklist_mapping_error_notification(samples_with_errors):
    print('send_checklist_mapping_error_notification ', samples_with_errors)
    logger.info('email_curators.py | send_checklist_mapping_error_notification | len(samples_with_errors)={}'.format(
        len(samples_with_errors)))
    # TODO: send formated list of errors containign sample tite alias value and valid mapping list

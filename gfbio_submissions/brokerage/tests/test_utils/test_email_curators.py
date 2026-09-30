# -*- coding: utf-8 -*-
from django.conf import settings
from django.contrib.auth.models import Group
from django.core import mail
from django.test import TestCase, override_settings

from gfbio_submissions.brokerage.utils.email_curators import (
    CURATORS_GROUP_NAME,
    get_curator_emails,
    mail_curators,
)
from gfbio_submissions.users.models import User


class TestEmailCurators(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.curator = User.objects.create_user(
            username="curator_user",
            email="curator@example.com",
            password="password",
        )
        curators_group, _ = Group.objects.get_or_create(name=CURATORS_GROUP_NAME)
        curators_group.user_set.add(cls.curator)

    def test_get_curator_emails(self):
        self.assertEqual(["curator@example.com"], get_curator_emails())

    def test_mail_curators_sends_to_curators_with_subject_prefix(self):
        mail.outbox.clear()
        result = mail_curators(subject="Test subject", message="Test message")

        self.assertTrue(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(
            "{0}Test subject".format(settings.EMAIL_SUBJECT_PREFIX),
            mail.outbox[0].subject,
        )
        self.assertEqual(["curator@example.com"], mail.outbox[0].to)
        self.assertEqual("Test message", mail.outbox[0].body)

    def test_mail_curators_falls_back_to_admins_when_no_curators(self):
        Group.objects.get(name=CURATORS_GROUP_NAME).user_set.clear()
        mail.outbox.clear()

        result = mail_curators(subject="Fallback subject", message="Fallback message")

        self.assertFalse(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(
            "{0}Fallback subject".format(settings.EMAIL_SUBJECT_PREFIX),
            mail.outbox[0].subject,
        )
        self.assertEqual(
            [admin_email for _, admin_email in settings.ADMINS],
            mail.outbox[0].to,
        )

    def test_mail_curators_falls_back_when_curators_have_no_email(self):
        self.curator.email = ""
        self.curator.save()
        mail.outbox.clear()

        result = mail_curators(subject="No email subject", message="No email message")

        self.assertFalse(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(
            [admin_email for _, admin_email in settings.ADMINS],
            mail.outbox[0].to,
        )

    def test_mail_curators_no_fallback_when_disabled(self):
        Group.objects.get(name=CURATORS_GROUP_NAME).user_set.clear()
        mail.outbox.clear()

        result = mail_curators(
            subject="Silent subject",
            message="Silent message",
            fallback_to_admins=False,
        )

        self.assertFalse(result)
        self.assertEqual(0, len(mail.outbox))

    @override_settings(ADMINS=[("Admin One", "admin1@example.com"), ("Admin Two", "admin2@example.com")])
    def test_mail_curators_also_notify_admins_unions_recipients(self):
        mail.outbox.clear()
        result = mail_curators(
            subject="Notify admins subject",
            message="Notify admins message",
            also_notify_admins=True,
        )

        self.assertTrue(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(
            "{0}Notify admins subject".format(settings.EMAIL_SUBJECT_PREFIX),
            mail.outbox[0].subject,
        )
        self.assertEqual(
            ["curator@example.com", "admin1@example.com", "admin2@example.com"],
            mail.outbox[0].to,
        )
        self.assertEqual("Notify admins message", mail.outbox[0].body)

    @override_settings(ADMINS=[("Overlap Admin", "curator@example.com"), ("Other Admin", "other@example.com")])
    def test_mail_curators_also_notify_admins_dedupes_overlapping_address(self):
        mail.outbox.clear()
        result = mail_curators(
            subject="Dedupe subject",
            message="Dedupe message",
            also_notify_admins=True,
        )

        self.assertTrue(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(["curator@example.com", "other@example.com"], mail.outbox[0].to)
        self.assertEqual(1, mail.outbox[0].to.count("curator@example.com"))

    @override_settings(ADMINS=[("Admin One", "admin1@example.com")])
    def test_mail_curators_also_notify_admins_no_curators_single_fallback(self):
        Group.objects.get(name=CURATORS_GROUP_NAME).user_set.clear()
        mail.outbox.clear()

        result = mail_curators(
            subject="Fallback with flag subject",
            message="Fallback with flag message",
            also_notify_admins=True,
        )

        self.assertFalse(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(
            "{0}Fallback with flag subject".format(settings.EMAIL_SUBJECT_PREFIX),
            mail.outbox[0].subject,
        )
        self.assertEqual(["admin1@example.com"], mail.outbox[0].to)

    def test_mail_curators_flag_off_unchanged_with_admins_present(self):
        mail.outbox.clear()
        result = mail_curators(subject="Flag off subject", message="Flag off message")

        self.assertTrue(result)
        self.assertEqual(1, len(mail.outbox))
        self.assertEqual(["curator@example.com"], mail.outbox[0].to)
        for _, admin_email in settings.ADMINS:
            self.assertNotIn(admin_email, mail.outbox[0].to)

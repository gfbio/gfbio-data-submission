# -*- coding: utf-8 -*-
from django.test import TestCase

from ...exceptions.transfer_exceptions import (
    InvalidCenterName,
    TransferClientError,
    TransferServerError,
)
from ...models.center_name import CenterName
from ...models.submission import Submission
from ...utils.center_name import resolve_and_validate_center_name


class CenterNameResolverTest(TestCase):
    def test_none_fk_raises_invalid_center_name(self):
        submission = Submission.objects.create(center_name=None)
        with self.assertRaises(InvalidCenterName):
            resolve_and_validate_center_name(submission)

    def test_empty_string_center_name_raises(self):
        center = CenterName.objects.create(center_name="")
        submission = Submission.objects.create(center_name=center)
        with self.assertRaises(InvalidCenterName):
            resolve_and_validate_center_name(submission)

    def test_whitespace_only_center_name_raises(self):
        center = CenterName.objects.create(center_name="   ")
        submission = Submission.objects.create(center_name=center)
        with self.assertRaises(InvalidCenterName):
            resolve_and_validate_center_name(submission)

    def test_valid_center_name_returned(self):
        center = CenterName.objects.create(center_name="CustomCenter")
        submission = Submission.objects.create(center_name=center)
        self.assertEqual(
            "CustomCenter", resolve_and_validate_center_name(submission)
        )

    def test_invalid_center_name_not_auto_retried(self):
        # InvalidCenterName must NOT subclass the retryable transfer errors,
        # otherwise autoretry_for would retry instead of hard-failing.
        self.assertFalse(issubclass(InvalidCenterName, TransferClientError))
        self.assertFalse(issubclass(InvalidCenterName, TransferServerError))

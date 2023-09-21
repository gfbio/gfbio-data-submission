# -*- coding: utf-8 -*-
import json

from django.test import TestCase

from gfbio_submissions.brokerage.forms.submission_comment_form import SubmissionCommentForm


# from gfbio_submissions.brokerage.forms import SubmissionCommentForm


class TestSubmissionCommentForm(TestCase):

    def test_unbound_form(self):
        form = SubmissionCommentForm()
        self.assertFalse(form.is_bound)

    def test_valid_form(self):
        comment_text = 'A valid Comment'
        form = SubmissionCommentForm({'comment': comment_text})
        self.assertTrue(form.is_valid())
        self.assertEqual(comment_text, form.cleaned_data['comment'])

    def test_empty_form(self):
        form = SubmissionCommentForm({})
        self.assertFalse(form.is_valid())
        error_json = json.loads(form.errors.as_json())
        self.assertIn('comment', error_json.keys())

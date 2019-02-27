# -*- coding: utf-8 -*-

from django.core.management import BaseCommand

from gfbio_submissions.brokerage.models import Submission


class Command(BaseCommand):

    @staticmethod
    def migrate_upload_models():
        submissions = Submission.objects.all()
        print('No. of Submissions', len(submissions))

    def handle(self, *args, **options):
        self.migrate_upload_models()

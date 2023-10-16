# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE


class Command(BaseCommand):
    help = (
        "shows total numbers of submissions vs. "
        "submissions with sites gfbio-xxx & local"
    )

    def handle(self, *args, **kwargs):
        all_submissions = len(Submission.objects.all())
        gfbio_related_submissions = len(
            Submission.objects.filter(site__username__startswith="gfbio")
        )
        local_site_submissions = len(
            Submission.objects.filter(site__username=HOSTING_SITE)
        )

        print("\nsubmissions for sites")
        print("\tall\tgfbio\tlocal-site")
        print(
            "\t{0}\t{1}\t{2}".format(
                all_submissions, gfbio_related_submissions, local_site_submissions
            )
        )
        print("------------------------------------------")

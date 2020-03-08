# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.brokerage.models import SiteConfiguration, Submission
from gfbio_submissions.submission_ui.configuration.settings import HOSTING_SITE
from gfbio_submissions.users.models import User


class Command(BaseCommand):
    help = 'shows total numbers of submissions vs. ' \
           'submissions with sites gfbio-xxx & local'

    def handle(self, *args, **kwargs):

        gfbio_related_submissions = Submission.objects.filter(
            site__username__contains='gfbio')
        print('\n****************\tgfbio_related_submissions\t**************')
        for submission in gfbio_related_submissions:
            print('pk: ', submission.pk, ' | site: ', submission.site,
                  ' | user: ', submission.user, ' | ',
                  submission.submitting_user)

        local_site_submissions = Submission.objects.filter(
            site__username=HOSTING_SITE)
        print('\n****************\tlocal_site_submissions\t**************')
        print('\n\tpk:\tsite:\tuser:\tsubmitting_user:\tsite.username:')
        for submission in local_site_submissions:
            print('\t', submission.pk, '\t', submission.site, '\t',
                  submission.user, '\t', submission.submitting_user, '\t',
                  submission.site.username)

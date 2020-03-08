# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.brokerage.models import Submission
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
        print(
            '\n\tpk:\tsite:\tuser:\tsubmitting_user:\tuser_for_submitting_user:')
        for submission in local_site_submissions:
            try:
                user = User.objects.get(pk=int(submission.submitting_user))
                user_status = '{0}:{1}'.format(user.pk, user.username)
            except User.DoesNotExist:
                user_status = 'no user found for pk={0}'.format(
                    int(submission.submitting_user))

            print('\t{0}\t{1}\t{2}\t{3}\t{4}'.format(
                submission.pk, submission.site, submission.user,
                submission.submitting_user, user_status)
            )

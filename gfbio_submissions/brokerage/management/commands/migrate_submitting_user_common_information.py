# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand
from django.db.transaction import atomic

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.generic.models import SiteConfiguration
from gfbio_submissions.users.models import User


class Command(BaseCommand):
    help = 'migrate submission submitting_user_common_information, by ' \
           'looking for email addresses to match or create users and ' \
           'assigning this user to the respective submission'

    def add_arguments(self, parser):
        parser.add_argument(
            '--write_db',
            action='store_true',
            default=False,
            help='Actually edit the database',
        )
        parser.add_argument(
            '-s', '--split_char',
            type=str,
            default=';',
            help='Split-character for submitting_user_common_information. '
                 'Default is ";".'
        )

    def migrate_common_information_to_user(self, submission, split_char,
                                           write=False):
        if not submission:
            return
        print(
            '-------------------------------------------\nprocessing: '
            '{0} | user: {1} | submitting_user: {2} | '
            'submitting_user_common_information: {3}'.format(
                submission, submission.user, submission.submitting_user,
                submission.submitting_user_common_information)
        )
        if len(submission.submitting_user_common_information) == 0:
            print(
                '\tsubmitting_user_common_information of length 0. Do nothing')
            return
        splitted_info = submission.submitting_user_common_information.split(
            split_char, )
        for info in splitted_info:
            info = info.strip()
            if '@' in info:
                if info.count(' ') == 0:
                    users = User.objects.filter(email=info)
                    if len(users) == 1:
                        if users[0] == submission.user:
                            print(
                                '\tuser {0} found, it is matching '
                                'submission.user, set '
                                'submitting_user_common_information to empty '
                                'string'.format(users.first())
                            )
                            if write:
                                submission.submitting_user_common_information = ''
                                submission.save()
                        else:
                            print(
                                '\tsubmission user: {0}. not matching found '
                                'user: {1}'.format(submission.user, users[0]))
                            if 'gfbio' in submission.user.username:
                                print(
                                    '\t\treplace "gfbio-user" with found user for this submission')
                                if write:
                                    submission.user = users[0]
                                    submission.submitting_user_common_information = ''
                                    submission.save()
                            else:
                                print('\t\t ... do nothing')
                    # FIXME: multiple users with same email is basically an error
                    elif len(users) > 1:
                        print(
                            '\tmultiple users found for {0}. {1} users found.'
                            ''.format(info, len(users)))
                        for mu in users:
                            print(
                                '\t\tuser: {0} | email: {}'.format(mu,
                                                                   mu.email))
                    elif len(users) == 0:
                        print(
                            '\t{0} | user not found ... create one and set as submission owner'.format(
                                info))
                        if write:
                            user = User.objects.create(
                                username=info,
                                email=info,
                                is_active=False,
                                site_configuration=SiteConfiguration.objects.get_hosting_site_configuration(),
                            )
                            submission.user = user
                            submission.submitting_user_common_information = ''
                            submission.save()
                        print(
                            '\t.... done. username: {0} | submission.user: {1}'.format(
                                info, submission.user))
                else:
                    print(
                        '\tFound whitespaces in string with @ ...  do nothing here ')
            else:
                pass

    @atomic
    def handle(self, *args, write_db, **kwargs):
        if not write_db:
            print('Running in dry mode, not hitting the database '
                  '(--write_db not passed)')
        submissions = Submission.objects.select_for_update()
        for submission in submissions:
            self.migrate_common_information_to_user(submission=submission,
                                                    split_char=kwargs[
                                                        'split_char'],
                                                    write=write_db)

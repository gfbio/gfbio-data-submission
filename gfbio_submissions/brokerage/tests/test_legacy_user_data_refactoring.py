# -*- coding: utf-8 -*-
import random
import string

from django.contrib.auth.models import Permission
from django.test import TestCase

from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential
from gfbio_submissions.users.models import User


class TestSubmittingUserMigration(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.resource_cred = ResourceCredential.objects.create(
            title='Resource Title',
            url='https://www.example.com',
            authentication_string='letMeIn'
        )
        cls.default_site_config = SiteConfiguration.objects.create(
            title=HOSTING_SITE,
            ena_server=cls.resource_cred,
            ena_report_server=cls.resource_cred,
            pangaea_token_server=cls.resource_cred,
            pangaea_jira_server=cls.resource_cred,
            helpdesk_server=cls.resource_cred,
            comment='Default configuration',
            contact='kevin@horstmeier.de'
        )
        cls.permissions = Permission.objects.filter(
            content_type__app_label='brokerage',
            name__endswith='upload')

        cls._generate_submissions(4)
        cls._generate_submissions(2, space=True)
        all = Submission.objects.all()
        sub1 = all[2]
        sub2 = all[3]
        sub1.user = sub2.user
        sub1.save()
        all[1].user.delete()
        cls._generate_with_special_cases()

    @classmethod
    def _create_random_user(cls):
        letters = string.ascii_lowercase
        rand_str = ''.join(random.choice(letters) for i in range(4))
        rand_int = random.randint(0, 10000)
        user = User.objects.create(
            username=rand_str,
            external_user_id='{}'.format(rand_int),
        )
        user.name = '{} {}'.format(rand_str, rand_str)
        user.email = '{}@{}.de'.format(rand_str, rand_str)
        user.site_configuration = cls.default_site_config
        user.save()
        user.user_permissions.add(*cls.permissions)
        return user

    @classmethod
    def _generate_submissions(cls, count=1, space=False):
        for i in range(0, count):
            user = cls._create_random_user()
            Submission.objects.create(
                user=user,
                submitting_user=user.id,
                submitting_user_common_information='{};{}'.format(user.name,
                                                                  user.email) if not space else '{} {}'.format(
                    user.name, user.email), )

    @classmethod
    def _generate_with_special_cases(cls):
        user = None
        Submission.objects.create(
            user=user,
            submitting_user='' if not user else user.id,
            submitting_user_common_information='bjkla;oin@oai.de;oiha',
        )
        user = cls._create_random_user()
        Submission.objects.create(
            user=user,
            submitting_user=user.id,
            submitting_user_common_information='only_email@aol.de',
        )
        user_g = User.objects.create(
            username='gfbio',
        )
        Submission.objects.create(
            user=user_g,
            submitting_user='' if not user_g else user_g.id,
            submitting_user_common_information=';;{}'.format(user.email),
        )

    # @staticmethod
    # def print_processing(s):
    #     print('--------------------------------------\nprocessing: ', s,
    #           ' user: ', s.user,
    #           ' submitting_user ', s.submitting_user, ' common info. >',
    #           s.submitting_user_common_information, '<')
    #
    # def conditional_user_create(self, s, splitted_info, simulate=True):
    #     if simulate:
    #         print(
    #             '\n---\tRunning as simulation, printing to console only\t---\n')
    #     for e in splitted_info:
    #         e = e.strip()
    #         if '@' in e:
    #             if e.count(' ') == 0:
    #                 users = User.objects.filter(email=e)
    #                 if len(users) == 1:
    #                     if users[0] == s.user:
    #                         print('\tuser: ', users[0],
    #                               ' found and is matching submission.user, do '
    #                               'nothing except common inf can be set to ""')
    #                         if not simulate:
    #                             s.submitting_user_common_information = ''
    #                             s.save()
    #                     else:
    #                         print(
    #                             '\tsubmission user: {}. not matching found user: {}'.format(
    #                                 s.user, users[0]))
    #                         if 'gfbio' in s.user.username:
    #                             print(
    #                                 '\t\treplace gfbio with found user for this '
    #                                 'submission')
    #                             if not simulate:
    #                                 s.user = users[0]
    #                                 s.submitting_user_common_information = ''
    #                                 s.save()
    #                         else:
    #                             print('\t\t ... do nothing')
    #                 # TODO multiple users with same email is basically an error
    #                 elif len(users) > 1:
    #                     print('\tmultiple user found for {} ... '.format(e, ),
    #                           len(users))
    #                     for mu in users:
    #                         print('\t\tuser: ', mu, ' email: ', mu.email)
    #                 elif len(users) == 0:
    #                     print('\t', e,
    #                           ' user not in sytem .. create one and set in '
    #                           'submission ...')
    #                     if not simulate:
    #                         u = User.objects.create(
    #                             username=e,
    #                             email=e,
    #                             is_active=False,
    #                             site_configuration=self.default_site_config,
    #                         )
    #                         s.user = u
    #                         s.submitting_user_common_information = ''
    #                         s.save()
    #                     print('\t.... done. username: ', e,
    #                           ' | submission.user: ',
    #                           s.user)
    #             else:
    #                 print(
    #                     '\tFound whitespaces in string with @ ...  do nothing here ')
    #         else:
    #             pass

    # def map_submitting_user(self):
    #     for s in Submission.objects.all():
    #         self.print_processing(s)
    #         # FIXME: info where ; is not split character, but space
    #         spl = s.submitting_user_common_information.split(';',)
    #         self.conditional_user_create(s, spl, simulate=False)

    # def test_map_common_inf(self):
    #     self._generate_submissions(4)
    #     self._generate_submissions(2, space=True)
    #     all = Submission.objects.all()
    #     sub1 = all[2]
    #     sub2 = all[3]
    #     sub1.user = sub2.user
    #     sub1.save()
    #
    #     all[1].user.delete()
    #     self._generate_with_special_cases()
    #
    #     for s in Submission.objects.all():
    #         self.print_processing(s)
    #         spl = s.submitting_user_common_information.split(';', )
    #         self.conditional_user_create(s, spl, simulate=False)
    #
    #     print('\n\n##########################\n\n')
    #
    #     for s in Submission.objects.all():
    #         self.print_processing(s)
    #         spl = s.submitting_user_common_information.split(';', )
    #         self.conditional_user_create(s, spl, simulate=False)
    #
    #     print('\n\n##########################\n\n')
    #
    #     for s in Submission.objects.all():
    #         self.print_processing(s)
    #         spl = s.submitting_user_common_information.split(' ', )
    #         self.conditional_user_create(s, spl, simulate=False)
    #
    #     print('\n\n##########################\n\n')
    #
    #     for s in Submission.objects.all():
    #         self.print_processing(s)
    #         spl = s.submitting_user_common_information.split(' ', )
    #         self.conditional_user_create(s, spl, simulate=False)

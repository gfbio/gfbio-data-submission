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
        cls.site = User.objects.create(
            username=HOSTING_SITE
        )
        cls.site.name = 'hosting site'
        cls.site.email = 'hosting@site.de'
        cls.site.is_site = True
        cls.site.is_user = False
        cls.site.save()
        cls.site.user_permissions.add(*cls.permissions)

    @classmethod
    def _generate_submissions(cls, count=1):
        for i in range(0, count):
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

            Submission.objects.create(
                site=cls.site,
                user=user,
                submitting_user=user.id,
                submitting_user_common_information='{};{}'.format(user.name,
                                                                  user.email), )

    def map_submitting_user(self):
        for s in Submission.objects.all():
            print('\nprocessing: ', s, ' user: ', s.user, ' site: ', s.site,
                  ' submitting_user ', s.submitting_user, ' common info. ',
                  s.submitting_user_common_information)
            spl = s.submitting_user_common_information.split(';')
            # FIXME: info where ; is not split character, but space
            for e in spl:
                if '@' in e:
                    users = User.objects.filter(email=e)
                    if len(users) == 1:
                        if users[0] == s.user:
                            print('\tuser: ', users[0],
                                  ' found and is matching submission.user, common inf can be deleted')
                            # TODO: set submitting_user_common_infomation to ''
                        else:
                            print(
                                '\tsubmission user: {}  . not matching found user: {}'.format(
                                    s.user, users[0]))
                            # TODO: if submission.user is old_gfbio_portal/gfbio, set found user as new user
                    elif len(users) > 1:
                        print('\tmultiple user found for {} ... '.format(e, ),
                              len(users))
                        for mu in users:
                            print('\t\tuser: ', mu, ' email: ', mu.email)
                    elif len(users) == 0:
                        print('\t', e,
                              ' user not in sytem .. create one and set in submission ...')
                        u = User.objects.create(
                            username=e,
                            email=e,
                            is_active=False,
                            site_configuration=self.default_site_config,
                        )
                        s.user = u
                        s.save()
                        print('\t.... done ', u, ' | ', s.user)

    def test_map_common_inf(self):
        self._generate_submissions(6)
        sub = Submission.objects.first()
        sub.user = None
        sub.save()
        all = Submission.objects.all()
        sub1 = all[2]
        sub2 = all[3]
        sub1.user = sub2.user
        sub1.save()

        all[1].user.delete()

        self.map_submitting_user()

        print('##########################')

        self.map_submitting_user()

# -*- coding: utf-8 -*-
import random
import string
from io import StringIO

from django.contrib.auth.models import Permission
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase

from gfbio_submissions.brokerage.management.commands.migrate_submitting_user_common_information import \
    Command
from gfbio_submissions.brokerage.models import Submission
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE
from gfbio_submissions.generic.models import SiteConfiguration, \
    ResourceCredential
from gfbio_submissions.users.models import User


class TestMigrateCommonInformation(SimpleTestCase):

    def test_none_args(self):
        result = Command().migrate_common_information_to_user(None, None, None)
        self.assertIsNone(result)


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
                # submitting_user=user.id,
                submitting_user_common_information='{};{}'.format(user.name,
                                                                  user.email) if not space else '{} {}'.format(
                    user.name, user.email), )

    @classmethod
    def _generate_with_special_cases(cls):
        user = None
        Submission.objects.create(
            user=user,
            # submitting_user='' if not user else user.id,
            submitting_user_common_information='bjkla;oin@oai.de;oiha',
        )
        user = cls._create_random_user()
        Submission.objects.create(
            user=user,
            # submitting_user=user.id,
            submitting_user_common_information='only_email@aol.de',
        )
        user_g = User.objects.create(
            username='gfbio',
        )
        Submission.objects.create(
            user=user_g,
            # submitting_user='' if not user_g else user_g.id,
            submitting_user_common_information=';;{}'.format(user.email),
        )

    @classmethod
    def _generate_test_data(cls):
        cls._generate_submissions(4)
        cls._generate_submissions(2, space=True)
        all = Submission.objects.all()
        sub1 = all[2]
        sub2 = all[3]
        sub1.user = sub2.user
        sub1.save()
        all[1].user.delete()
        cls._generate_with_special_cases()

    def call_command(self, *args, **kwargs):
        call_command(
            "migrate_submitting_user_common_information",
            *args,
            stdout=StringIO(),
            stderr=StringIO(),
            **kwargs,
        )

    def test_dry_run(self):
        self._generate_test_data()
        self.call_command()
        for submission in Submission.objects.all():
            self.assertNotEqual('',
                                submission.submitting_user_common_information)

    def test_empty_common_inf(self):
        user = self._create_random_user()
        submission = Submission.objects.create(
            user=user,
            # submitting_user=user.id,
            submitting_user_common_information='',
        )
        self.call_command('--write_db')
        self.assertEqual(submission, Submission.objects.first())

    def test_user_match_common_inf(self):
        user = self._create_random_user()
        submission = Submission.objects.create(
            user=user,
            # submitting_user=user.id,
            submitting_user_common_information=';{0};{1};;'.format(user.name,
                                                                   user.email),
        )
        self.assertIn(user.email, submission.submitting_user_common_information)
        self.assertEqual(user, submission.user)
        self.call_command('--write_db')
        submission = Submission.objects.first()
        self.assertEqual('', submission.submitting_user_common_information)

    def test_no_match_gfbio_user(self):
        user = self._create_random_user()
        user_g = User.objects.create(
            username='gfbio',
        )
        submission = Submission.objects.create(
            user=user_g,
            # submitting_user=user_g.id,
            submitting_user_common_information=';;{}'.format(user.email),
        )
        self.assertIn(user.email, submission.submitting_user_common_information)
        self.assertEqual(user_g, submission.user)
        self.assertNotEqual(user, submission.user)
        self.call_command('--write_db')
        submission = Submission.objects.first()
        self.assertEqual('', submission.submitting_user_common_information)
        self.assertEqual(user, submission.user)

    def test_no_matching_user(self):
        user_1 = self._create_random_user()
        user_2 = self._create_random_user()
        submission = Submission.objects.create(
            user=user_1,
            # submitting_user=user_1.id,
            submitting_user_common_information=';{0};{1};;'.format(user_2.name,
                                                                   user_2.email),
        )
        self.call_command('--write_db')
        self.assertEqual(user_1, submission.user)
        self.assertNotEqual('', submission.submitting_user_common_information)

    def test_no_user_found(self):
        email = 'j.doe@example.com'
        submission = Submission.objects.create(
            user=None,
            # submitting_user='',
            submitting_user_common_information='John Doe;{0};'.format(email),
        )
        self.assertEqual(0, len(User.objects.filter(email=email)))
        self.assertNotEqual('', submission.submitting_user_common_information)
        self.call_command('--write_db')
        submission = Submission.objects.first()
        self.assertEqual('', submission.submitting_user_common_information)
        user = User.objects.get(email=email)
        self.assertEqual(email, user.username)
        self.assertEqual(user, submission.user)

    def test_white_space_email(self):
        user = self._create_random_user()
        email = user.email
        submission = Submission.objects.create(
            user=user,
            # submitting_user=user.id,
            submitting_user_common_information=';{0};{1};;'.format(
                user.name, email.replace('@', ' @')),
        )
        self.call_command('--write_db')
        self.assertEqual(submission, Submission.objects.first())

    def test_invalid_split_char(self):
        self._generate_submissions(4)
        self.call_command(split_char='x')

    def test_semicolon_split_char(self):
        # only ; as split char
        self._generate_submissions(4)
        self.call_command('--write_db', split_char=' ')
        for submission in Submission.objects.all():
            self.assertNotEqual('',
                                submission.submitting_user_common_information)
        self.call_command('--write_db', split_char=';')
        for submission in Submission.objects.all():
            self.assertEqual('',
                             submission.submitting_user_common_information)

    def test_full_migration(self):
        self._generate_test_data()
        start_len = len(Submission.objects.all())
        self.call_command('--write_db', split_char=';')
        self.call_command('--write_db', split_char=' ')
        end_len = len(Submission.objects.filter(submitting_user_common_information=''))
        self.assertEqual((start_len-1), end_len)

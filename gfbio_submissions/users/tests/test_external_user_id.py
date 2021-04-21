# -*- coding: utf-8 -*-
from django.db import IntegrityError
from django.test import TestCase

from ..models import User, ExternalUserId


class TestExternalUserId(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = User.objects.create(
            username='user1',
            email='user1@user.de'
        )

    def test_model(self):
        euid = ExternalUserId.objects.create(
            user=self.user,
            external_id='0815',
            provider='myself'
        )
        self.assertIsInstance(euid, ExternalUserId)

    def test_str(self):
        provider = 'oneLtd'
        id = self.user.externaluserid_set.create(external_id='1',
                                                 provider=provider,
                                                 resolver_url='https://one.org/?id=')
        self.assertEqual('{}_{}'.format(self.user.username, provider),
                         '{}'.format(id))

    def test_relation_create(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.externaluserid_set.create(external_id='1',
                                            provider='one ltd.',
                                            resolver_url='https://one.org/?id=')
        self.assertLess(0, len(self.user.externaluserid_set.all()))

    def test_relation_create_multiple(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.externaluserid_set.create(external_id='1',
                                            provider='one ltd.',
                                            resolver_url='https://one.org/?id=')
        self.user.externaluserid_set.create(external_id='1',
                                            provider='two ltd.',
                                            resolver_url='https://one.org/?id=')
        self.assertEqual(2, len(self.user.externaluserid_set.all()))

    def test_relation_create_double_id(self):
        self.user.externaluserid_set.create(external_id='1',
                                            provider='one ltd.',
                                            resolver_url='https://one.org/?id=')
        self.assertRaises(IntegrityError, self.user.externaluserid_set.create,
                          external_id='1', provider='one ltd.')

    def test_relation_create_second_id_for_provider(self):
        self.user.externaluserid_set.create(external_id='1',
                                            provider='one ltd.',
                                            resolver_url='https://one.org/?id=')
        self.assertRaises(IntegrityError, self.user.externaluserid_set.create,
                          external_id='1000', provider='one ltd.')

    def test_method_create(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.update_or_create_external_user_id('1', 'one ltd.')
        self.assertEqual(1, len(self.user.externaluserid_set.all()))

    def test_method_create_number(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.update_or_create_external_user_id(1, 'one ltd.')
        self.assertEqual(1, len(self.user.externaluserid_set.all()))

    def test_method_create_multiple(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.update_or_create_external_user_id('1', 'one ltd.')
        self.user.update_or_create_external_user_id('4', 'two ltd.')
        self.assertEqual(2, len(self.user.externaluserid_set.all()))

    def test_method_create_double_id(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.update_or_create_external_user_id('1', 'one ltd.')
        self.user.update_or_create_external_user_id('1', 'one ltd.')
        self.assertEqual(1, len(self.user.externaluserid_set.all()))

    def test_method_create_second_for_provider(self):
        self.assertEqual(0, len(self.user.externaluserid_set.all()))
        self.user.update_or_create_external_user_id('1', 'one ltd.')
        self.user.update_or_create_external_user_id('2', 'one ltd.')
        self.assertEqual(1, len(self.user.externaluserid_set.all()))

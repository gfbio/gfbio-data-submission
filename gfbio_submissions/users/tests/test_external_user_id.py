# -*- coding: utf-8 -*-
from django.test import TestCase

from ..models import User


class TestExternalUserId(TestCase):

    def test_simple(self):
        user = User.objects.create(
            username='user1',
            email='user1@user.de'
        )
        user.externaluserid_set.create(external_id='1', provider='one ltd.',
                                       resolver_url='https://one.org/?id=')

        # not working. good !
        # user.externaluserid_set.create(external_id='1', provider='one ltd.',
        #                                resolver_url='https://one.org/?id=')

        # working. good !
        # user.externaluserid_set.create(external_id='2', provider='one ltd.',
        #                                resolver_url='https://one.org/?id=')

# -*- coding: utf-8 -*-
from django.contrib.auth.models import UserManager

from gfbio_submissions.brokerage.models import SiteConfiguration


class CustomUserManager(UserManager):

    def create_user(self, username, email=None, password=None, **extra_fields):
        user = super(CustomUserManager, self).create_user(
            username,
            email=None,
            password=None,
            **extra_fields
        )
        user.site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
        # """
        # Create and save a User with the given email and password.
        # """
        # if not email:
        #     raise ValueError(_('The Email must be set'))
        # email = self.normalize_email(email)
        # user = self.model(email=email, **extra_fields)
        # user.set_password(password)
        user.save()
        return user

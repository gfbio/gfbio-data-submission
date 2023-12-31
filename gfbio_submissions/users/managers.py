# -*- coding: utf-8 -*-
from django.contrib.auth.models import UserManager

from gfbio_submissions.generic.models.site_configuration import SiteConfiguration


class CustomUserManager(UserManager):
    def create_user(self, username, email=None, password=None, **extra_fields):
        user = super(CustomUserManager, self).create_user(username, email=email, password=password, **extra_fields)
        user.site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
        user.save()
        return user

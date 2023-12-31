from typing import Any

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.http import HttpRequest

from gfbio_submissions.generic.models.site_configuration import SiteConfiguration


class AccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request: HttpRequest):
        return getattr(settings, "ACCOUNT_ALLOW_REGISTRATION", True)

    def save_user(self, request, user, form, commit=False):
        user = super(AccountAdapter, self).save_user(request, user, form, commit=False)
        if not user.site_configuration:
            user.site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
            user.save()
        return user


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def is_open_for_signup(self, request: HttpRequest, sociallogin: Any):
        return getattr(settings, "ACCOUNT_ALLOW_REGISTRATION", True)

    def populate_user(self, request, sociallogin, data):
        user = super(SocialAccountAdapter, self).populate_user(request, sociallogin, data)
        if not user.site_configuration:
            user.site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
        return user

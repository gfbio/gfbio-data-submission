# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.generic.models.site_configuration import SiteConfiguration
from gfbio_submissions.users.models import User


class Command(BaseCommand):
    help = ("Set user.site_configuration to HOSTING_SITE "
            "if user.site_configuration is not yet set.")

    def handle(self, *args, **kwargs):
        for user in User.objects.filter(site_configuration=None).filter(is_user=True).filter(is_site=False):
            print("\nassign site_configuration to user <{0}>".format(user.username))
            user.site_configuration = SiteConfiguration.objects.get_hosting_site_configuration()
            user.save()
            print("... done.")

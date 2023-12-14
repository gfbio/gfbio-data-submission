# -*- coding: utf-8 -*-
from django.db import models

from config.settings.base import ADMINS
from gfbio_submissions.generic.configuration.settings import HOSTING_SITE


class SiteConfigurationManager(models.Manager):
    # FIXME: obsolete, remove once ready to do so
    # def get_site_configuration(self, site=None):
    #     try:
    #         # return self.get(site=site)
    #         return None
    #     except self.model.DoesNotExist:
    #         # FIXME: what if there is no 'default' in database ?
    #         # return self.get(title='default')
    #         return None

    # TODO: add tests
    def get_hosting_site_configuration(self):
        admin, email = ADMINS[0] if len(ADMINS) else ("admin", "default@{0}.de".format(HOSTING_SITE))
        obj, created = self.get_or_create(
            title=HOSTING_SITE,
            defaults={
                "title": HOSTING_SITE,  # == 'local-site'
                "contact": email,
                "comment": "created by using defaults in get_or_create call "
                "for SiteConfiguration with "
                "title={0}".format(HOSTING_SITE),
            },
        )
        return obj

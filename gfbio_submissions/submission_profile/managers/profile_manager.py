# -*- coding: utf-8 -*-
from django.db import models

from ..configuration.settings import DEFAULT_PROFILE_NAME


class ProfileManager(models.Manager):

    def activate_user_profile(self, profile_id):
        obj = self.get(pk=profile_id)
        if obj.user is None:
            return None
        self.filter(user=obj.user).update(active_user_profile=False)
        obj.active_user_profile = True
        obj.save()

    def get_active_user_profile(self, user):
        active = None
        try:
            active = self.filter(user=user).get(active_user_profile=True)
        except self.model.MultipleObjectsReturned:
            pass
        except self.model.DoesNotExist:
            pass
        return active

    def get_active_user_profile_name(self, user):
        active = DEFAULT_PROFILE_NAME
        try:
            p = self.filter(user=user).get(active_user_profile=True)
            active = p.name
        except self.model.MultipleObjectsReturned:
            pass
        except self.model.DoesNotExist:
            pass
        return active

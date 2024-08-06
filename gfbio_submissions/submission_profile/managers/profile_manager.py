# -*- coding: utf-8 -*-
from django.db import models


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

        # active = self.filter(user).filter(active_user_profile=True)
        # if len(active) > 1:
        #     # more than one active profile
        #     pass
        # elif len(active) == 0:
        #     # no active profile
        #     pass
        # else:
        #     pass
        # return active


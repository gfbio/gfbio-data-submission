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

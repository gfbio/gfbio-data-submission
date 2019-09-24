# -*- coding: utf-8 -*-
from django.db import models


class UserManager(models.Manager):

    def get_user_values_safe(self, id):
        user_values = {}
        user_set = self.filter(pk=id).values('email', 'username')
        if len(user_set) == 1:
            user_values = user_set[0]
        return user_values

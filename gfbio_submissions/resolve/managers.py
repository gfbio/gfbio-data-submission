# -*- coding: utf-8 -*-
from django.db import models


class AccessionManager(models.Manager):

    def create_or_delete(self, identifier, release_status):
        """creates obj if currently not existing and release
         status is not PUBLIC. Nothing happens if obj is already
         existing. obj is deleted if found and release status is PUBLIC"""
        try:
            obj = self.get(identifier=identifier)
            if release_status == 'PUBLIC':
                return obj.delete()
        except self.model.DoesNotExist:
            if release_status != 'PUBLIC':
                return self.create(identifier=identifier)

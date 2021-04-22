# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.users.models import User


# TODO: remove this after 'externa_user_id' has been removed
class Command(BaseCommand):
    help = 'If a user instance has a external_user_id which is not None, it curently' \
           'only can be a GWDG goe_id. This command creates a ExternalUserId instance' \
           'for every user and assigns this goe_id as the id value.'

    def handle(self, *args, **kwargs):
        for user in User.objects.all():
            print('\nprocessing user:  {0}'.format(user))
            if user.external_user_id and len(user.external_user_id):
                print('\tcreate ExternalUserId instance with value: {0}'.format(
                    user.external_user_id))
                user.update_or_create_external_user_id(
                    external_id=user.external_user_id,
                    provider='goe_id'
                )
            else:
                print(
                    '\t... do nothing for user.external_user_id with value: {0}'.format(
                        user.external_user_id))

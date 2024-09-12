# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from gfbio_submissions.submission_profile.models.profile import Profile
from ...models import User


class Command(BaseCommand):
    help = "Create a submission profile for user, if user has not at least one submission profile assigned."

    def handle(self, *args, **kwargs):
        default_profile = None
        try:
            default_profile = Profile.objects.get(name="gfbio")
        except Profile.DoesNotExist:
            print("WARNING: Default profile does not exist. Cancel now ...")
            return None
        if not default_profile.system_wide_profile:
            print("WARNING: Default profile is not a system wide profile. Cancel now ...")
            return None
        counter = 0
        for user in User.objects.all():
            if len(user.user_profile.all()) == 0:
                cloned = default_profile.clone_for_user(user)
                counter += 1
                print('Added default profile for user: ', user.username, ' pk: ', user.pk)
        print("INFO: added default profile for users ", counter, " times")

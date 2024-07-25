from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL
from ..models.field import Field

from ...brokerage.configuration.settings import GENERIC
from ...brokerage.models.submission import Submission


class Profile(TimeStampedModel):
    name = models.SlugField(max_length=128, unique=True)
    target = models.CharField(max_length=16, choices=Submission.TARGETS, default=GENERIC)

    system_wide_profile = models.BooleanField(default=False)

    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="user_profiles",
        on_delete=models.CASCADE,
    )

    # fields = models.ManyToManyField(Field, blank=True)
    # profile_fields = models.ManyToManyField(Field, blank=True, through="ProfileFieldExtension", related_name="profile_fields")

    # inherit_fields_from = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL)

    # TODO: workflow field, sub models like preferences, chain of tasks etc.
    # TODO: owner ?
    # TODO: language ? or in preferences
    # TODO: general structure like, grid, menues, footer, general texts or descriptions
    # TODO: global actions, buttons or similar
    # TODO: global design ?

    # TODO Brainstorming DASS-1942:
    #   - at start of feature, nobody can create or mod profile, except via admin

    # TODO: validator for unique-in-profile field_name (or mapping_to)
    #   https://docs.djangoproject.com/en/4.2/ref/validators/

    def save(self, *args, **kwargs):
        super(Profile, self).save(*args, **kwargs)
        system_wide_mandatories = Field.objects.filter(system_wide_mandatory=True)
        from .profile_field_extension import ProfileFieldExtension
        for s in system_wide_mandatories:
            # self.fields.add(s)
            # ProfileFieldExtension.objects.get_or_create(
            #     field=s,
            #     profile=self,
            #     defaults={"mandatory": True, "system_wide_mandatory": True}
            # )
            # print("Profile save ", s.__dict__)
            ProfileFieldExtension.objects.add_from_field(field=s, profile=self)

    def clone_for_user(self, user, name):
        pk = self.pk
        self.pk = None
        self.user = user
        self.name = name
        # print(self.profilefieldextension_set.all())
        self.save()
        # print(self.pk , '  ', pk)
        # TODO: move to manager with exception checks
        original_profile = Profile.objects.get(pk=pk)
        # print(original_profile.profilefieldextension_set.all())
        for profile_field in original_profile.profilefieldextension_set.all():
            # self.profilefieldextension_set.add(pfield)
            # print('\tclone field ', pfield, ' from ', original_profile.pk, ' to ', self.pk)
            profile_field.clone(profile=self)
        # print(self.user.username)
        return self

    def __str__(self):
        if self.user:
            return "{}_{}".format(self.user.username, self.name)
        return self.name

    def all_fields(self):
        # if self.inherit_fields_from is None:
        #     return self.fields.all()
        # return self.fields.all().union(self.inherit_fields_from.profile_fields.all())
        # return self.fields.all()
        return self.profilefieldextension_set.all()

    def form_fields(self):
        return self.all_fields().order_by("order")
        # return self.all_fields()

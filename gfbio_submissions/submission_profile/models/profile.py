from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL
from ..managers.profile_manager import ProfileManager
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
        related_name="user_profile",
        on_delete=models.CASCADE,
    )

    # TODO: validator for unique-in-profile field_name (or mapping_to)
    #   https://docs.djangoproject.com/en/4.2/ref/validators/
    active_user_profile = models.BooleanField(default=False)

    objects = ProfileManager()
    def save(self, *args, **kwargs):
        super(Profile, self).save(*args, **kwargs)
        system_wide_mandatories = Field.objects.filter(system_wide_mandatory=True)
        from .profile_field_extension import ProfileFieldExtension
        for s in system_wide_mandatories:
            ProfileFieldExtension.objects.add_from_field(field=s, profile=self)

    def clone_for_user(self, user, name=None):
        pk = self.pk
        self.pk = None
        self.user = user
        if name:
            self.name = name
        else:
            self.name = "{}_profile".format(user.username)
        self.system_wide_profile = False
        self.save()
        # TODO: move to manager with exception checks
        original_profile = Profile.objects.get(pk=pk)
        # exclude system_wide_mandatory fields as they are added in self.save()
        for profile_field in original_profile.profilefieldextension_set.exclude(system_wide_mandatory=True):
            profile_field.clone(profile=self)
        return self

    def __str__(self):
        return self.name

    def all_fields(self):
        # TODO: removed inheritance in DASS-1941 temporarily. discuss if needed at all
        # if self.inherit_fields_from is None:
        #     return self.fields.all()
        # return self.fields.all().union(self.inherit_fields_from.profile_fields.all())
        # return self.fields.all()
        return self.profilefieldextension_set.all()

    def form_fields(self):
        return self.all_fields().order_by("order")

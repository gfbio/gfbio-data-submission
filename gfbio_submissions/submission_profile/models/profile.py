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

    # parent = models.ForeignKey('self', null=True, blank=True, related_name='clones')

    system_wide_profile = models.BooleanField(default=False)

    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="user_profile",
        on_delete=models.CASCADE,
    )

    fields = models.ManyToManyField(Field, through="ProfileField")

    # TODO: validator for unique-in-profile field_name (or mapping_to)
    #   https://docs.djangoproject.com/en/4.2/ref/validators/
    active_user_profile = models.BooleanField(default=False)

    objects = ProfileManager()

    def save(self, *args, **kwargs):
        super(Profile, self).save(*args, **kwargs)
        # print('profile save ', self.name)
        if self.active_user_profile:
            Profile.objects.filter(user=self.user).exclude(pk=self.pk).update(active_user_profile=False)
        # add system_wide_mandatory fields to this profile
        system_wide_mandatories = Field.objects.filter(system_wide_mandatory=True)
        for s in system_wide_mandatories:
            self.fields.add(s)

    def clone_for_user(self, user, name=None):
        # clone returns a  new instance for convenience,
        # but in general the cloning instance becomes the clone in the process
        pk = self.pk
        self.pk = None
        self.user = user
        if name:
            self.name = name
        else:
            self.name = "user_id_{}_profile".format(user.pk)
        self.system_wide_profile = False
        self.save()
        # TODO: move to manager with exception checks
        original_profile = Profile.objects.get(pk=pk)
        for f in original_profile.profilefield_set.all():
            f.clone(profile=self, field=f.field)

        return self

    def __str__(self):
        return self.name

    # TODO: as @property ?
    def all_fields(self):
        # TODO: removed inheritance in DASS-1941 temporarily. discuss if needed at all
        # if self.inherit_fields_from is None:
        #     return self.fields.all()
        # return self.fields.all().union(self.inherit_fields_from.profile_fields.all())

        return self.profilefield_set.all()

    # TODO: as @property ?
    def form_fields(self):
        return self.all_fields().order_by("field__order")

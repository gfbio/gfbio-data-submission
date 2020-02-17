from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _

from gfbio_submissions.brokerage.models import SiteConfiguration
from gfbio_submissions.users.managers import CustomUserManager


class User(AbstractUser):
    is_site = models.BooleanField(default=False)
    is_user = models.BooleanField(default=True)

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = CharField(_("Name of User"), blank=True, max_length=255)

    # https://docs.djangoproject.com/en/2.2/ref/models/fields/#null
    external_user_id = CharField(
        _('external userid'),
        max_length=32,
        unique=True,
        blank=True,
        null=True,
        help_text=_(
            'Not Required. 32 characters or fewer. '
            'Has to be unique if not Null.'),
        error_messages={
            'unique': _("A user with that external_user_id already exists."),
        },
    )

    site_configuration = models.ForeignKey(
        SiteConfiguration,
        null=True,
        blank=True,
        related_name='configuration_users',
        on_delete=models.SET_NULL)

    objects = CustomUserManager()

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})

    @classmethod
    def get_user_values_safe(cls, submitting_user_id):
        user_values = {}
        if submitting_user_id != '':
            user_set = cls.objects.filter(
                pk=int(submitting_user_id)).values('email', 'username')
            if len(user_set) == 1:
                user_values = user_set[0]
        return user_values

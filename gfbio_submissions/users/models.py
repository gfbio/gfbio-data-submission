from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import CharField
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _


class User(AbstractUser):
    is_site = models.BooleanField(default=False)
    is_user = models.BooleanField(default=True)

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = CharField(_("Name of User"), blank=True, max_length=255)

    # TODO: use generic name not goestern..
    # https://docs.djangoproject.com/en/2.2/ref/models/fields/#null
    goesternid = CharField(
        _('goesternid'),
        max_length=32,
        unique=True,
        blank=True,
        null=True,
        help_text=_(
            'Not Required. 32 characters or fewer. digits only'),
        error_messages={
            'unique': _("A user with that goesternid already exists."),
        },
    )

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

from django.contrib.auth.models import AbstractUser
from django.db import models, IntegrityError
from django.db.models import CharField, BooleanField
from django.urls import reverse
from django.utils.translation import ugettext_lazy as _
from model_utils.models import TimeStampedModel

from gfbio_submissions.generic.models import SiteConfiguration
from gfbio_submissions.users.managers import CustomUserManager


class User(AbstractUser):
    is_site = models.BooleanField(default=False)
    is_user = models.BooleanField(default=True)

    # First Name and Last Name do not cover name patterns
    # around the globe.
    name = CharField(_("Name of User"), blank=True, max_length=255)

    # TODO: need 2-step migration, first migrate to new model then remove here
    # TODO: provide context for external_user_id, e.g. where does it come from,
    #   so that unique constrain works only in this context.
    #   e.g. provider_a id=1 is different than provider_b id=1
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

    # True if the user has accepted the current terms of service and
    # privacy policy
    agreed_to_terms = BooleanField(default=False)
    agreed_to_privacy = BooleanField(default=False)

    site_configuration = models.ForeignKey(
        SiteConfiguration,
        null=True,
        blank=True,
        related_name='configuration_users',
        on_delete=models.SET_NULL)

    objects = CustomUserManager()

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})

    def update_or_create_external_user_id(self, external_id, provider,
                                          resolver_url=''):
        default_vals = {
            'external_id': external_id,
            'provider': provider,
        }
        if len(resolver_url):
            default_vals['resolver_url'] = resolver_url
        try:
            return self.externaluserid_set.update_or_create(
                external_id=external_id,
                provider=provider,
                defaults=default_vals,
            )
        except IntegrityError as ie:
            return (None, False)

    @classmethod
    def get_user_values_safe(cls, submitting_user_id):
        user_values = {}
        if submitting_user_id != '':
            user_set = cls.objects.filter(
                pk=int(submitting_user_id)).values('email', 'username')
            if len(user_set) == 1:
                user_values = user_set[0]
        return user_values


class ExternalUserId(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    external_id = CharField(
        null=False, blank=False, max_length=32,
        help_text=_('Not Required. 32 characters or fewer. Has to be unique '
                    'if not Null.'),
    )
    provider = CharField(
        max_length=32,
        help_text=_('Name of provider of this external id')
    )
    resolver_url = models.URLField(
        null=True, blank=True, max_length=64,
        help_text=_('An URL to resolve the value of "external_id"')
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['external_id', 'provider'],
                                    name='unique_id_for_provider'),
            models.UniqueConstraint(fields=['user', 'provider'],
                                    name='unique_id_for_user'),

        ]

    def __str__(self):
        return '{}_{}'.format(self.user.username, self.provider)

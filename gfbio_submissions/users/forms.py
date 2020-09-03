from allauth.socialaccount.forms import SignupForm
from django import forms as form
from django.contrib.auth import forms, get_user_model
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

User = get_user_model()


class UserChangeForm(forms.UserChangeForm):
    class Meta(forms.UserChangeForm.Meta):
        model = User


class UserCreationForm(forms.UserCreationForm):
    error_message = forms.UserCreationForm.error_messages.update(
        {"duplicate_username": _("This username has already been taken.")}
    )

    class Meta(forms.UserCreationForm.Meta):
        model = User

    def clean_username(self):
        username = self.cleaned_data["username"]

        try:
            User.objects.get(username=username)
        except User.DoesNotExist:
            return username

        raise ValidationError(self.error_messages["duplicate_username"])


class AgreeTosSocialSignupForm(SignupForm):
    agree_terms = form.BooleanField(required=True,
                                    label="Agree to terms of service")

    def save(self, request):
        # Ensure you call the parent class's save.
        # .save() returns a User object.
        user = super(AgreeTosSocialSignupForm, self).save(request)

        # Add your own processing here.
        user.agreed_to_terms = self.cleaned_data.get('agree_terms')
        user.save()
        # You must return the original result.
        return user

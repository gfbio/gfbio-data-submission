# -*- coding: utf-8 -*-

from django import forms
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.shortcuts import render, redirect
from django.urls import path, reverse
from django.utils.html import format_html

from .models.field import Field
from .models.field_option import FieldOption
from .models.field_type import FieldType
from .models.profile import Profile
from .models.profile_field import ProfileField

User = get_user_model()


class DuplicateProfileForm(forms.Form):
    """Form for selecting a user when duplicating a profile."""
    user = forms.ModelChoiceField(
        queryset=User.objects.all().order_by('username'),
        label="Select user for duplicated profile",
        help_text="Choose the user who will own the duplicated profile.",
        empty_label="-- Select a user --"
    )


class ProfileFieldInline(admin.TabularInline):
    model = ProfileField
    extra = 1


class ProfileAdmin(admin.ModelAdmin):
    inlines = [ProfileFieldInline]
    search_fields = ["user__username", "name"]
    list_filter = ["system_wide_profile", "active_user_profile"]
    list_display = ["__str__", "system_wide_profile", "user", "active_user_profile", ]
    fields = [
        "name",
        "target",
        "system_wide_profile",
        "user",
        "active_user_profile",
        # "fields",
    ]
    actions = ["duplicate_profile"]

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path(
                'duplicate-profile/',
                self.admin_site.admin_view(self.duplicate_profile_view),
                name='submission_profile_profile_duplicate',
            ),
        ]
        return custom_urls + urls

    def duplicate_profile_view(self, request):
        """View for handling profile duplication with user selection."""
        profile_ids = request.GET.getlist('ids')
        profiles = Profile.objects.filter(id__in=profile_ids)

        if not profiles.exists():
            self.message_user(request, "No profiles selected.")
            return redirect('admin:submission_profile_profile_changelist')

        if request.method == 'POST':
            form = DuplicateProfileForm(request.POST)
            if form.is_valid():
                selected_user = form.cleaned_data['user']
                duplicated_count = 0

                for profile in profiles:
                    try:
                        profile.clone_for_user(selected_user)
                        duplicated_count += 1
                    except Exception as e:
                        self.message_user(
                            request,
                            f"Error duplicating profile '{profile.name}': {str(e)}",
                        )

                if duplicated_count > 0:
                    self.message_user(
                        request,
                        f"Successfully duplicated {duplicated_count} profile(s) for user '{selected_user.username}'.",
                    )

                return redirect('admin:submission_profile_profile_changelist')
        else:
            form = DuplicateProfileForm()

        context = {
            'form': form,
            'profiles': profiles,
            'opts': self.model._meta,
            'site_header': admin.site.site_header,
            'has_view_permission': True,
        }

        return render(request, 'admin/submission_profile/profile/duplicate.html', context)

    def duplicate_profile(self, request, queryset):
        """Admin action to initiate profile duplication."""
        selected_ids = ','.join(str(id) for id in queryset.values_list('id', flat=True))
        url = reverse('admin:submission_profile_profile_duplicate')
        return redirect(f"{url}?ids={selected_ids}")

    duplicate_profile.short_description = "Duplicate profile for another user"
    duplicate_profile.allowed_permissions = ('change',)


class FieldOptionInline(admin.TabularInline):
    model = FieldOption
    extra = 1


class FieldAdmin(admin.ModelAdmin):
    inlines = [FieldOptionInline, ]
    ordering = ["position", "order"]
    list_display = ["__str__", "position", "order", "system_wide_mandatory", ]
    list_filter = ["system_wide_mandatory", ]


admin.site.register(Profile, ProfileAdmin)
admin.site.register(Field, FieldAdmin)
admin.site.register(FieldType)

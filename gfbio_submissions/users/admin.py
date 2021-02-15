from django.contrib import admin
from django.contrib.auth import admin as auth_admin
from django.contrib.auth import get_user_model

from gfbio_submissions.users.forms import UserChangeForm, UserCreationForm

User = get_user_model()


@admin.register(User)
class UserAdmin(auth_admin.UserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm

    fieldsets = (('User', {
        'fields': ('name', 'site_configuration', 'is_site', 'is_user',
                   'external_user_id',
                   'agreed_to_terms',
                   'agreed_to_privacy')}),) + auth_admin.UserAdmin.fieldsets
    list_display = ['username', 'name', 'email', 'get_groups', 'last_login',
                    'date_joined']
    list_filter = [
        'groups', 'is_staff', 'is_superuser', 'is_active', 'is_site', 'is_user']
    search_fields = ['name', 'username', 'email', 'groups__name']

    def get_groups(self, obj):
        res = ['{}'.format(g.name) for g in obj.groups.all()]
        return res

    get_groups.short_description = 'Groups'
    get_groups.admin_order_field = 'user__groups'

# -*- coding: utf-8 -*-
from rest_framework import permissions


class IsOwnerAndNonSystemWide(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        # but only if obj is not owned by a user
        if request.method in permissions.SAFE_METHODS and obj.user is None:
            return True

        # Write permissions are only allowed to the owner and if the
        # profile is not system wide profile
        return obj.system_wide_profile is False and obj.user == request.user

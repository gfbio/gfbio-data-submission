# -*- coding: utf-8 -*-
from rest_framework import permissions
from django.conf import settings

class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # TODO: mapping an IDM authenticated user to ob.property for
        #   single user ownership
        # Write permissions are only allowed to the owner.
        return obj.user == request.user

class APIAllowedHosts(permissions.BasePermission):
    """
    Ensure the request's IP address is on the safe list configured in Django settings.
    """
    def has_permission(self, request, view):

        remote_addr = request.META['REMOTE_ADDR']
        for valid_ip in settings.REST_SAFE_LIST_IPS:
            if remote_addr == valid_ip or remote_addr.startswith(valid_ip):
                return True

        return False

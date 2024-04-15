# -*- coding: utf-8 -*-
from rest_framework import permissions


class IsSubmissionOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.submission.user == request.user

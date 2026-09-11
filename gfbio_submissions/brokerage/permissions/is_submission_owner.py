# -*- coding: utf-8 -*-
from rest_framework import permissions


class IsSubmissionOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.submission.user == request.user


class IsOwnerOrSubmissionOwnerOrHasCuratorRights(IsSubmissionOwner):
    def has_object_permission(self, request, view, obj):
        if obj.user == request.user:
            return True
        if super().has_object_permission(request, view, obj):
            return True

        return request.user.has_perm("brokerage.curate_submissions")

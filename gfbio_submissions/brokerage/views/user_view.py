# -*- coding: utf-8 -*-
from rest_framework import permissions, mixins, generics
from rest_framework.authentication import SessionAuthentication, TokenAuthentication, BasicAuthentication
from drf_spectacular.utils import extend_schema
from gfbio_submissions.brokerage.serializers.user_serializer import UserSerializer
from gfbio_submissions.users.forms import User
from django.http import HttpResponse, JsonResponse


@extend_schema(exclude=True)
class UserView(generics.GenericAPIView):
    authentication_classes = (TokenAuthentication, BasicAuthentication, SessionAuthentication)
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        res = {
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name,
            "last_name": request.user.last_name,
            "groups": [group.name for group in request.user.groups.all()],
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser
        }
        return JsonResponse(res)
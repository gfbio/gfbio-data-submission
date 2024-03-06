# -*- coding: utf-8 -*-
from rest_framework import permissions
from rest_framework.generics import RetrieveAPIView

from ..models.profile import Profile
from ..serializers.profile_serializer import ProfileSerializer


class ProfileDetailView(RetrieveAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.AllowAny,)
    lookup_field = "name"

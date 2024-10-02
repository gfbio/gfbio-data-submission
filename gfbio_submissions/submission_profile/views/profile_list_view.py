# -*- coding: utf-8 -*-
from django.db.models import Q
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView

from ..models.profile import Profile
from ..serializers.profile_serializer import ProfileSerializer


class ProfileListView(ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)

    def get_queryset(self):
        user = self.request.user
        return Profile.objects.filter(Q(user=user) | Q(system_wide_profile=True))

# -*- coding: utf-8 -*-
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.generics import RetrieveAPIView, UpdateAPIView

from ..models.profile import Profile
from ..permissions.is_owner_and_non_system_wide import IsOwnerAndNonSystemWide
from ..serializers.profile_serializer import ProfileSerializer


class ProfileDetailView(RetrieveAPIView, UpdateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = (TokenAuthentication, BasicAuthentication)
    permission_classes = (IsOwnerAndNonSystemWide, )
    lookup_field = "name"

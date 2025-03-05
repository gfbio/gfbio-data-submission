# -*- coding: utf-8 -*-
from django.db.models import Q
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.generics import ListAPIView

from ..models.profile import Profile
from ..serializers.profile_list_serializer import ProfileListSerializer


class ProfileListView(ListAPIView):
    serializer_class = ProfileListSerializer
    authentication_classes = (BasicAuthentication, TokenAuthentication)

    def get_queryset(self):
        filter_system_wide_profiles = self.request.query_params.get('system_wide_profile', False)
        user = self.request.user
        if filter_system_wide_profiles == 'true' or filter_system_wide_profiles == 'True':
            return Profile.objects.filter(system_wide_profile=True)
        else:
            return Profile.objects.filter(Q(user=user) | Q(system_wide_profile=True))


# class ProfileActiveView(APIView):
#     serializer_class = ProfileListSerializer
#     authentication_classes = (BasicAuthentication, TokenAuthentication)
#
#     def get(self, request, format=None):
#         user = self.request.user
#         profile = Profile.objects.filter(user=user).filter(active_user_profile=True).first()
#         serializer = ProfileFlatSerializer(profile)
#         return Response(serializer.data, status=HTTP_200_OK)
#     # def get_queryset(self):
#     #     # filter_system_wide_profiles = self.request.query_params.get('system_wide_profile', False)
#     #     user = self.request.user
#     #     # if filter_system_wide_profiles == 'true' or filter_system_wide_profiles == 'True':
#     #     #     return Profile.objects.filter(system_wide_profile=True)
#     #     # else:
#     #     return Profile.objects.filter(user=user).filter(active_user_profile=True)

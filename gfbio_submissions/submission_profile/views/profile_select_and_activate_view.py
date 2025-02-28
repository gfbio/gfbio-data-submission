# -*- coding: utf-8 -*-
from pprint import pprint

from rest_framework import mixins, status, generics
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.response import Response

from ..models.profile import Profile
from ..permissions.is_owner_and_non_system_wide import IsOwnerAndNonSystemWide
from ..serializers.profile_serializer import ProfileSerializer


class ProfileSelectAndActivateView(mixins.UpdateModelMixin, generics.GenericAPIView, ):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = (BasicAuthentication, TokenAuthentication)

    # permission_classes = (IsOwnerAndNonSystemWide,)

    def put(self, request, *args, **kwargs):
        # return self.update(request, *args, **kwargs)
        # TODO: case 1: no user profile based on this system wide profile created yet
        print("----------------------------")
        profile = self.get_object()
        pprint(profile.__dict__)
        if profile.system_wide_profile is False:
            return Response(data={"error": "Only system-wide-profiles can be selected"},
                            status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        print("----------------------------")
        print(user)
        user_profile = profile.clone_for_user(user=user, name=f"{user.username}_{profile.name}")
        user_profile.active_user_profile = True
        user_profile.save()
        print("----------------------------")
        pprint(user_profile.__dict__)
        return Response(data={"id": user_profile.pk, "name": user_profile.name, "target": user_profile.target},
                        status=status.HTTP_200_OK)

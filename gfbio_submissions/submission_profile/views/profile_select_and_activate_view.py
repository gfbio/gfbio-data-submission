# -*- coding: utf-8 -*-

from rest_framework import mixins, status, generics
from rest_framework.authentication import TokenAuthentication, BasicAuthentication
from rest_framework.response import Response

from ..models.profile import Profile
from ..serializers.profile_serializer import ProfileSerializer


class ProfileSelectAndActivateView(mixins.UpdateModelMixin, generics.GenericAPIView, ):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = (BasicAuthentication, TokenAuthentication)

    def put(self, request, *args, **kwargs):

        profile = self.get_object()
        if profile.system_wide_profile is False:
            return Response(data={"error": "Only system-wide-profiles can be selected"},
                            status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        user_profile = Profile.objects.filter(user=user).filter(parent=profile).first()
        if user_profile is None:
            user_profile = profile.clone_for_user(user=user, name=f"cloned_{profile.name}")
            user_profile.active_user_profile = True
            user_profile.save()
        else:
            user_profile.active_user_profile = True
            user_profile.save()

        return Response(data={"id": user_profile.pk, "name": user_profile.name, "target": user_profile.target,
                              "parent_id": user_profile.parent.pk, "parent_name": user_profile.parent.name, },
                        status=status.HTTP_200_OK)

from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import permissions, serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView


@extend_schema(
    tags=["authentication"],
    operation_id="create auth token",
    summary="Create an authentication token",
    description=(
        "Create a DRF token for API authentication. Use the returned token in the `Authorization: Token <token>` header."
    ),
    request=None,
    responses={
        200: OpenApiResponse(
            description="Token created successfully.",
            response=inline_serializer(
                name="AuthTokenSessionResponse",
                fields={"token": serializers.CharField()},
            ),
        ),
        401: OpenApiResponse(description="Authentication credentials were not provided."),
    },
)
class AuthTokenView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        token, _ = Token.objects.get_or_create(user=request.user)
        return Response({"token": token.key}, status=status.HTTP_200_OK)

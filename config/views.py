from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view, inline_serializer
from rest_framework import parsers, permissions, serializers
from rest_framework.authtoken.views import ObtainAuthToken


@extend_schema_view(
    post=extend_schema(
        tags=["authentication"],
        operation_id="create auth token",
        auth=[],
        description="Create a DRF token for API authentication. Use the returned token in the `Authorization: Token <token>` header.",
        request=inline_serializer(
            name="AuthTokenRequest",
            fields={
                "username": serializers.CharField(),
                "password": serializers.CharField(),
            },
        ),
        responses={
            200: OpenApiResponse(
                description="Token created successfully.",
                response=inline_serializer(
                    name="AuthTokenResponse",
                    fields={"token": serializers.CharField()},
                ),
            ),
            400: OpenApiResponse(description="Invalid credentials."),
        },
    )
)
class AuthTokenView(ObtainAuthToken):
    parser_classes = (parsers.JSONParser,)
    authentication_classes = ()
    permission_classes = (permissions.AllowAny,)

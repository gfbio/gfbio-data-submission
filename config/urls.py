import re

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path, re_path
from django.views import defaults as default_views
from django.views.generic import TemplateView, RedirectView
from django.views.static import serve
from drf_spectacular.utils import extend_schema, OpenApiResponse, inline_serializer
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import parsers, permissions, serializers
from rest_framework.authtoken.views import obtain_auth_token

from gfbio_submissions.submission_ui.views import HomeView
from gfbio_submissions.submission_profile.views.profile_frontend_view import ProfileFrontendView

admin.site.site_header = 'GFBio administration version: {}'.format(settings.VERSION)


@extend_schema(
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
class AuthTokenView(ObtainAuthToken):
    parser_classes = (parsers.JSONParser,)
    authentication_classes = ()
    permission_classes = (permissions.AllowAny,)

urlpatterns = [
    path("", HomeView.as_view(), name="home"),
    path(
        "about/", TemplateView.as_view(template_name="pages/about.html"), name="about"
    ),

    # Django Admin, use {% url 'admin:index' %}
    path(settings.ADMIN_URL, admin.site.urls),

    # User management
    path("users/", include("gfbio_submissions.users.urls", namespace="users")),
    path("accounts/", include("allauth.urls")),
    path("oidc/", include("mozilla_django_oidc.urls")),

    # Your stuff: custom urls includes go here
    path("api/", include("gfbio_submissions.brokerage.urls", namespace="brokerage")),
    path("resolve/", include("gfbio_submissions.resolve.urls", namespace="resolve")),
    path("ui/", include("gfbio_submissions.submission_ui.urls", namespace="userinterface")),
    path("profile/", include("gfbio_submissions.submission_profile.urls", namespace="profile")),

    path("generic/", include("gfbio_submissions.generic.urls", namespace="generic")),

    re_path(r'favicon\.ico$', RedirectView.as_view(url='/static/images/favicon.ico')),
    re_path(r'sw\.js$', RedirectView.as_view(url='/static/js/sw.js')),
    path(
        route="new/",
        view=ProfileFrontendView.as_view(),
        name="create_submission_ui",
    ),
    re_path(
        route=r"^edit/(?P<submission_id>[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12})",
        view=ProfileFrontendView.as_view(),
        name="update_submission_ui",
    ),
    path(
        route="list/",
        view=ProfileFrontendView.as_view(),
        name="list_submission_ui",
    ),

]

urlpatterns += [
    re_path(
        r"^%s(?P<path>.*)$" % re.escape(settings.MEDIA_URL.lstrip("/")), serve, kwargs={"document_root": settings.MEDIA_ROOT}
    ),
]

if settings.DEBUG:
    # Static file serving when using Gunicorn + Uvicorn for local web socket development
    urlpatterns += staticfiles_urlpatterns()

# API URLS
urlpatterns += [
    # DRF auth token
    path("auth-token/", obtain_auth_token),
    path('api-auth/', include('rest_framework.urls')),
    path("api-schema/", SpectacularAPIView.as_view(), name="api-schema"),

]

if settings.DEBUG:
    # This allows the error pages to be debugged during development, just visit
    # these url in browser to see how these error pages look like.
    urlpatterns += [
        path(
            "400/",
            default_views.bad_request,
            kwargs={"exception": Exception("Bad Request!")},
        ),
        path(
            "403/",
            default_views.permission_denied,
            kwargs={"exception": Exception("Permission Denied")},
        ),
        path(
            "404/",
            default_views.page_not_found,
            kwargs={"exception": Exception("Page not Found")},
        ),
        path("500/", default_views.server_error),
    ]
    if "debug_toolbar" in settings.INSTALLED_APPS:
        import debug_toolbar

        urlpatterns = [path("__debug__/", include(debug_toolbar.urls))] + urlpatterns

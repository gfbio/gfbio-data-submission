import re

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.urls import include, path, re_path
from django.views import defaults as default_views
from django.views.generic import TemplateView, RedirectView
from django.views.static import serve
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.authtoken.views import obtain_auth_token

from gfbio_submissions.submission_ui.views import HomeView

admin.site.site_header = 'GFBio administration version: {}'.format(settings.VERSION)

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
    path("generic/", include("gfbio_submissions.generic.urls", namespace="generic")),

    re_path(r'favicon\.ico$', RedirectView.as_view(url='/static/images/favicon.ico')),
    re_path(r'sw\.js$', RedirectView.as_view(url='/static/js/sw.js')),

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
    # API base url
    path("api/", include("config.api_router")),
    # DRF auth token
    path("auth-token/", obtain_auth_token),
    path("api-schema/", SpectacularAPIView.as_view(), name="api-schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="api-schema"),
        name="api-docs",
    ),
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

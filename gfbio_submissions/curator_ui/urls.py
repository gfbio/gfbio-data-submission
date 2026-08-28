from django.urls import re_path

from . import views

app_name = "curator_ui"
urlpatterns = [
    re_path(
        route=r"",
        view=views.CuratorFrontendView.as_view(),
        name="curator_frontend",
    ),
]

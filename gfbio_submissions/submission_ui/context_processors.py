from django.conf import settings


def prod_env(request):
    data = {"prod_env": settings.IS_PROD_ENV}
    return data

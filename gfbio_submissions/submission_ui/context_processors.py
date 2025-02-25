from django.conf import settings


def prod_env(_request):
    data = {"prod_env": settings.IS_PROD_ENV}
    return data

def matomo_settings(_request):
    """
    Adds the Matomo Site ID to the template context.
    Returns None if no Site ID is defined.
    """
    return {
        "MATOMO_SITE_ID": getattr(settings, "MATOMO_SITE_ID", None),
    }

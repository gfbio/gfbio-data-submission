"""
Base settings to build other settings files upon.
"""

from pathlib import Path

import environ
from kombu import Queue

# VERSION NUMBER
# ------------------------------------------------------------------------------#
VERSION = "1.106.5"

ROOT_DIR = Path(__file__).resolve(strict=True).parent.parent.parent
# gfbio_submissions/
APPS_DIR = ROOT_DIR / "gfbio_submissions"

env = environ.Env()

READ_DOT_ENV_FILE = env.bool("DJANGO_READ_DOT_ENV_FILE", default=False)
if READ_DOT_ENV_FILE:
    # OS environment variables take precedence over variables from .env
    env.read_env(str(ROOT_DIR / ".env"))

# GENERAL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#debug
DEBUG = env.bool("DJANGO_DEBUG", False)
# Local time zone. Choices are
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# though not all of them may be available with every OS.
# In Windows, this must be set to your system time zone.
TIME_ZONE = "Europe/Berlin"
# https://docs.djangoproject.com/en/dev/ref/settings/#language-code
LANGUAGE_CODE = "en-us"
# https://docs.djangoproject.com/en/dev/ref/settings/#site-id
SITE_ID = env.int("DJANGO_SITE_ID", default=1)
# https://docs.djangoproject.com/en/dev/ref/settings/#use-i18n
USE_I18N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-l10n
USE_L10N = True
# https://docs.djangoproject.com/en/dev/ref/settings/#use-tz
USE_TZ = True
# https://docs.djangoproject.com/en/dev/ref/settings/#locale-paths
LOCALE_PATHS = [str(ROOT_DIR / "locale")]

# DATABASES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#databases
DATABASES = {"default": env.db("DATABASE_URL")}
DATABASES["default"]["ATOMIC_REQUESTS"] = True
# https://docs.djangoproject.com/en/stable/ref/settings/#std:setting-DEFAULT_AUTO_FIELD
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# URLS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#root-urlconf
ROOT_URLCONF = "config.urls"
# https://docs.djangoproject.com/en/dev/ref/settings/#wsgi-application
WSGI_APPLICATION = "config.wsgi.application"

# APPS
# ------------------------------------------------------------------------------
DJANGO_APPS = [
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # "django.contrib.humanize", # Handy template tags
    "django.contrib.admin",
    "django.forms",
]
THIRD_PARTY_APPS = [
    "crispy_forms",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "allauth.socialaccount.providers.github",
    "allauth.socialaccount.providers.orcid",
    "allauth.socialaccount.providers.google",
    "rest_framework",
    "rest_framework.authtoken",
    "django_celery_beat",
    "corsheaders",
    "drf_spectacular",
    "mozilla_django_oidc",
    "dt_upload",
]

LOCAL_APPS = [
    "gfbio_submissions.users.apps.UsersConfig",
    # Your stuff: custom apps go here
    "gfbio_submissions.brokerage.apps.BrokerageConfig",
    "gfbio_submissions.generic.apps.GenericConfig",
    "gfbio_submissions.resolve.apps.ResolveConfig",
    "gfbio_submissions.submission_profile.apps.SubmissionProfileConfig",
]
# https://docs.djangoproject.com/en/dev/ref/settings/#installed-apps
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# MIGRATIONS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#migration-modules
MIGRATION_MODULES = {"sites": "gfbio_submissions.contrib.sites.migrations"}

# AUTHENTICATION
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#authentication-backends
AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
    # "mozilla_django_oidc.auth.OIDCAuthenticationBackend",
    "gfbio_submissions.authentication.auth_backends.GFBioAuthenticationBackend",
]
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-user-model
AUTH_USER_MODEL = "users.User"
# https://docs.djangoproject.com/en/dev/ref/settings/#login-redirect-url
# LOGIN_REDIRECT_URL = "users:redirect"

LOGIN_REDIRECT_URL = env.str("LOGIN_REDIRECT_URL", "/profile/ui/")
LOGOUT_REDIRECT_URL = "/"
# https://docs.djangoproject.com/en/dev/ref/settings/#login-url
LOGIN_URL = "account_login"

# PASSWORDS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#password-hashers
PASSWORD_HASHERS = [
    # https://docs.djangoproject.com/en/dev/topics/auth/passwords/#using-argon2-with-django
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]
# https://docs.djangoproject.com/en/dev/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# MIDDLEWARE
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    # "django.middleware.common.BrokenLinkEmailsMiddleware",
    "gfbio_submissions.utils.middleware.LogBrokenLinksMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "gfbio_submissions.utils.middleware.RestrictedMediaMiddleware",
]

# STATIC
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#static-root
STATIC_ROOT = str(ROOT_DIR / "staticfiles")
# https://docs.djangoproject.com/en/dev/ref/settings/#static-url
STATIC_URL = "/static/"
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = [str(APPS_DIR / "static")]
# https://docs.djangoproject.com/en/dev/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = [
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
]

# MEDIA
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#media-root
MEDIA_ROOT = str(APPS_DIR / "media")
# https://docs.djangoproject.com/en/dev/ref/settings/#media-url
MEDIA_URL = "/media/"

# UPLOAD LIMITS
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#file-upload-max-memory-size
DATA_UPLOAD_MAX_MEMORY_SIZE = 31457280  # 10485760
# 9069953

# TEMPLATES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#templates
TEMPLATES = [
    {
        # https://docs.djangoproject.com/en/dev/ref/settings/#std:setting-TEMPLATES-BACKEND
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # https://docs.djangoproject.com/en/dev/ref/settings/#template-dirs
        "DIRS": [str(APPS_DIR / "templates")],
        # https://docs.djangoproject.com/en/dev/ref/settings/#app-dirs
        "APP_DIRS": True,
        "OPTIONS": {
            # https://docs.djangoproject.com/en/dev/ref/settings/#template-context-processors
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
                "gfbio_submissions.utils.context_processors.settings_context",
                "gfbio_submissions.users.context_processors.allauth_settings",
                "gfbio_submissions.submission_ui.context_processors.prod_env",
                "gfbio_submissions.submission_ui.context_processors.matomo_settings",
            ],
        },
    }
]

# https://docs.djangoproject.com/en/dev/ref/settings/#form-renderer
FORM_RENDERER = "django.forms.renderers.TemplatesSetting"

# http://django-crispy-forms.readthedocs.io/en/latest/install.html#template-packs
CRISPY_TEMPLATE_PACK = "bootstrap4"

# FIXTURES
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#fixture-dirs
FIXTURE_DIRS = (str(APPS_DIR / "fixtures"),)

# SECURITY
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#session-cookie-httponly
SESSION_COOKIE_HTTPONLY = True
# https://docs.djangoproject.com/en/dev/ref/settings/#csrf-cookie-httponly
CSRF_COOKIE_HTTPONLY = True
# https://docs.djangoproject.com/en/dev/ref/settings/#secure-browser-xss-filter
SECURE_BROWSER_XSS_FILTER = True
# https://docs.djangoproject.com/en/dev/ref/settings/#x-frame-options
X_FRAME_OPTIONS = "DENY"

# EMAIL
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#email-backend
EMAIL_BACKEND = env("DJANGO_EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")
# https://docs.djangoproject.com/en/dev/ref/settings/#email-timeout
EMAIL_TIMEOUT = 5

HOST_URL_ROOT = env("HOST_URL_ROOT", default="https://submissions.gfbio.org/")

# ADMIN
# ------------------------------------------------------------------------------
# Django Admin URL.
# ADMIN_URL = "admin/"
ADMIN_URL = env("DJANGO_ADMIN_URL", default="admin/")

# https://docs.djangoproject.com/en/dev/ref/settings/#admins
DJANGO_ADMINS = env.list(
    "DJANGO_ADMINS",
    default=[
        "Marc Weber:mweber@gfbio.org",
        "Ivaylo Kostadinov:ikostadi@gfbio.org",
    ],
)
ADMINS = [("""{}""".format(x.split(":")[0]), "{}".format(x.split(":")[1])) for x in DJANGO_ADMINS]

# https://docs.djangoproject.com/en/dev/ref/settings/#managers
MANAGERS = ADMINS

# LOGGING
# ------------------------------------------------------------------------------
# https://docs.djangoproject.com/en/dev/ref/settings/#logging
# See https://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {"format": "%(levelname)s %(asctime)s %(module)s " "%(process)d %(thread)d %(message)s"}
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    },
    "root": {"level": "INFO", "handlers": ["console"]},
}

# Celery
# ------------------------------------------------------------------------------
if USE_TZ:
    # http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-timezone
    CELERY_TIMEZONE = TIME_ZONE
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-broker_url
CELERY_BROKER_URL = env("CELERY_BROKER_URL")
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#result-extended
CELERY_RESULT_EXTENDED = True
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-result_backend
CELERY_RESULT_BACKEND = CELERY_BROKER_URL
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-accept_content
CELERY_ACCEPT_CONTENT = ["json"]
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-task_serializer
CELERY_TASK_SERIALIZER = "json"
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#std:setting-result_serializer
CELERY_RESULT_SERIALIZER = "json"
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#task-time-limit
# TODO: set to whatever value is adequate in your circumstances
CELERY_TASK_TIME_LIMIT = 25 * 60
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#task-soft-time-limit
# TODO: set to whatever value is adequate in your circumstances
CELERY_TASK_SOFT_TIME_LIMIT = 20 * 60
# http://docs.celeryproject.org/en/latest/userguide/configuration.html#beat-scheduler
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#worker-send-task-events
CELERY_WORKER_SEND_TASK_EVENTS = True
# https://docs.celeryq.dev/en/stable/userguide/configuration.html#std-setting-task_send_sent_event
CELERY_TASK_SEND_SENT_EVENT = True

CELERY_TASK_QUEUES = [
    Queue('default', routing_key='default'),
    Queue('ena_transfer', routing_key='ena_transfer'),
]

CELERY_TASK_DEFAULT_QUEUE = 'default'
CELERY_TASK_DEFAULT_ROUTING_KEY = 'default'

# django-allauth
# ------------------------------------------------------------------------------
ACCOUNT_ALLOW_REGISTRATION = env.bool("DJANGO_ACCOUNT_ALLOW_REGISTRATION", True)
# https://django-allauth.readthedocs.io/en/latest/configuration.html
ACCOUNT_AUTHENTICATION_METHOD = "username"
# https://django-allauth.readthedocs.io/en/latest/configuration.html
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = True
SOCIALACCOUNT_AUTO_SIGNUP = False
# https://django-allauth.readthedocs.io/en/latest/configuration.html
# "mandatory", "optional", or "none"
ACCOUNT_EMAIL_VERIFICATION = "optional"
# https://django-allauth.readthedocs.io/en/latest/configuration.html
ACCOUNT_ADAPTER = "gfbio_submissions.users.adapters.AccountAdapter"

# ACCOUNT_SIGNUP_FORM_CLASS = "gfbio_submissions.users.forms.AgreeTosSocialSignupForm"
SOCIALACCOUNT_FORMS = {"signup": "gfbio_submissions.users.forms.AgreeTosSocialSignupForm"}
# https://django-allauth.readthedocs.io/en/latest/configuration.html
SOCIALACCOUNT_ADAPTER = "gfbio_submissions.users.adapters.SocialAccountAdapter"

# django-rest-framework
# -------------------------------------------------------------------------------
# django-rest-framework - https://www.django-rest-framework.org/api-guide/settings/
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    # "DEFAULT_SCHEMA_CLASS": "rest_framework.schemas.coreapi.AutoSchema",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

# By Default swagger ui is available only to admin user(s). You can change permission classes to change that
# See more configuration options at https://drf-spectacular.readthedocs.io/en/latest/settings.html#settings
SPECTACULAR_SETTINGS = {
    "TITLE": "submission.gfbio.org API",
    "DESCRIPTION": "Documentation of API endpoints of submission.gfbio.org",
    "VERSION": "1.0.0",
    "SERVE_PERMISSIONS": ["rest_framework.permissions.AllowAny"],
    "PREPROCESSING_HOOKS": ["config.settings.base.whitelist_api_endpoints_preprocessing_hook_func"],
}

# Your stuff...
# ------------------------------------------------------------------------------

# django-cors-headers - https://github.com/adamchainz/django-cors-headers#setup
# FIXME: can this be a list of strings ?
# CORS_URLS_REGEX = r"^/api/.*$"
CORS_URLS_REGEX = r'^.*$'

# OpenIDConnect SETTINGS
# ------------------------------------------------------------------------------
OIDC_RP_CLIENT_ID = env("OIDC_RP_CLIENT_ID", default="no_oidc_cl_id")
OIDC_RP_CLIENT_SECRET = env("OIDC_RP_CLIENT_SECRET", default="no_oidc_cl_secret")

OIDC_RP_SIGN_ALGO = env("OIDC_RP_SIGN_ALGO", default="HS256")
OIDC_OP_JWKS_ENDPOINT = env("OIDC_OP_JWKS_ENDPOINT", default="no_jwks_url")

# OIDC_OP_AUTHORIZATION_ENDPOINT = "https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php"
OIDC_OP_AUTHORIZATION_ENDPOINT = "https://keycloak.sso.gwdg.de/auth/realms/GFBio/protocol/openid-connect/auth"
# OIDC_OP_TOKEN_ENDPOINT = "https://sso.gfbio.org/simplesaml/module.php/oidc/access_token.php"
OIDC_OP_TOKEN_ENDPOINT = "https://keycloak.sso.gwdg.de/auth/realms/GFBio/protocol/openid-connect/token"
# OIDC_OP_USER_ENDPOINT = "https://sso.gfbio.org/simplesaml/module.php/oidc/userinfo.php"
OIDC_OP_USER_ENDPOINT = "https://keycloak.sso.gwdg.de/auth/realms/GFBio/protocol/openid-connect/userinfo"

OIDC_USE_NONCE = False  # Default:	True

# OIDC_RP_SCOPES = "openid email profile address phone goeId"
# OIDC_USERNAME_ALGO = "gfbio_submissions.authentication.user_name.generate_username"

# GFBio Helpdesk Shadow-Account Service
# ------------------------------------------------------------------------------
JIRA_ACCOUNT_SERVICE_USER = env("JIRA_ACCOUNT_SERVICE_USER", default="no_account_service_user")
JIRA_ACCOUNT_SERVICE_PASSWORD = env("JIRA_ACCOUNT_SERVICE_PASSWORD", default="no_account_service_password")

# REST API Permissions
# ------------------------------------------------------------------------------
REST_SAFE_LIST_IPS = [
    "127.0.0.1",
    "[::1]",
    "172.",  # docker local network /8
    "10.",  # docker swarm network /8
]
REST_SAFE_DOMAINS = []


def whitelist_api_endpoints_preprocessing_hook(endpoints):
    # your modifications to the list of operations that are exposed in the schema
    visibleEndpoints = []
    for path, path_regex, method, callback in endpoints:
        if path.startswith("/api/submissions/"):
            visibleEndpoints.append((path, path_regex, method, callback))
    return visibleEndpoints


whitelist_api_endpoints_preprocessing_hook_func = whitelist_api_endpoints_preprocessing_hook

IS_PROD_ENV = env.bool("IS_PROD_ENV", False)

# Uploads
# ------------------------------------------------------------------------------
DATA_UPLOAD_MAX_MEMORY_SIZE = 800 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 800 * 1024 * 1024

# Fallbacks
# ------------------------------------------------------------------------------
FALLBACK_CATEGORY_NAME = "unclassified"
DEFAULT_COLLECTION_ID = 1  # specified via fixture

# Django Imagekit
# ------------------------------------------------------------------------------
# IMAGEKIT_S3_NETWORK_RETRY_COUNT = 2  # number of retries for accessing thumbnails
# IMAGEKIT_CACHEFILE_DIR = str(Path("CACHE") / "images")

# Determine Environment
DJANGO_ENV = env("DJANGO_ENV", default="development")
DJANGO_UPLOAD_TOOLS_USE_CLIENTSIDE_UPLOAD = env.bool("DJANGO_UPLOAD_TOOLS_USE_CLIENTSIDE_UPLOAD", default=False)
DJANGO_UPLOAD_TOOLS_USE_CLOUD_UPLOAD = env.bool("DJANGO_UPLOAD_TOOLS_USE_CLOUD_UPLOAD", default=False)
DJANGO_UPLOAD_TOOLS_USE_ARUNA = env.bool("DJANGO_UPLOAD_TOOLS_USE_ARUNA", default=False)
DJANGO_UPLOAD_TOOLS_USE_SIGNAL_BACKUP = env.bool("DJANGO_UPLOAD_TOOLS_USE_SIGNAL_BACKUP", default=False)
DJANGO_UPLOAD_TOOLS_USE_MODEL_BACKUP = env.bool("DJANGO_UPLOAD_TOOLS_USE_MODEL_BACKUP", default=False)
DJANGO_UPLOAD_TOOLS_BACKUP_MODEL = env.str("DJANGO_UPLOAD_TOOLS_BACKUP_MODEL", default="dt_upload.DTUpload")
DJANGO_UPLOAD_TOOLS_BACKUP_MODEL_FILE_FIELD = env.str(
    "DJANGO_UPLOAD_TOOLS_BACKUP_MODEL_FILE_FIELD", default="upload_file"
)
DJANGO_UPLOAD_TOOLS_USE_REUPLOAD = env.bool("DJANGO_UPLOAD_TOOLS_USE_REUPLOAD", default=False)
if DJANGO_UPLOAD_TOOLS_USE_CLOUD_UPLOAD:
    # TODO: if s3 is used also elsewhere besides only for django-upload-tools, it may be a better idea to
    #   use this in a more selective way. For this purpose it is ok to assign the settings only if
    #   DJANGO_UPLOAD_TOOLS_USE_CLOUD_UPLOAD is set to True (defaults to False)
    # STORAGES
    # ------------------------------------------------------------------------------

    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    AWS_ACCESS_KEY_ID = env("DJANGO_AWS_ACCESS_KEY_ID", default=None)
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    AWS_SECRET_ACCESS_KEY = env("DJANGO_AWS_SECRET_ACCESS_KEY", default=None)
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    AWS_STORAGE_BUCKET_NAME = env("DJANGO_AWS_STORAGE_BUCKET_NAME", default=None)
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    AWS_S3_REGION_NAME = env("DJANGO_AWS_S3_REGION_NAME", default="default")
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    AWS_S3_ENDPOINT_URL = env("DJANGO_AWS_S3_ENDPOINT_URL", default=None)

    CLOUD_MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/"

if DJANGO_UPLOAD_TOOLS_USE_SIGNAL_BACKUP or DJANGO_UPLOAD_TOOLS_USE_MODEL_BACKUP:
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    BACKUP_AWS_ACCESS_KEY_ID = env("BACKUP_DJANGO_AWS_ACCESS_KEY_ID", default=None)
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    BACKUP_AWS_SECRET_ACCESS_KEY = env("BACKUP_DJANGO_AWS_SECRET_ACCESS_KEY", default=None)
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    BACKUP_AWS_STORAGE_BUCKET_NAME = env("BACKUP_DJANGO_AWS_STORAGE_BUCKET_NAME", default=None)
    # https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#settings
    BACKUP_AWS_S3_ENDPOINT_URL = env("BACKUP_DJANGO_AWS_S3_ENDPOINT_URL", default=None)

    BACKUP_MEDIA_URL = f"{BACKUP_AWS_S3_ENDPOINT_URL}/"

# Aruna Settings to create collections
# ------------------------------------------------------------------------------
DJANGO_UPLOAD_TOOLS_CREATE_COLLECTION = env.bool("DJANGO_UPLOAD_TOOLS_CREATE_COLLECTION", default=False)
# The gRPC server endpoint to connect to (e.g. grpc.aruna-storage.org)
DJANGO_UPLOAD_TOOLS_AOS_HOST = env("DJANGO_UPLOAD_TOOLS_AOS_HOST", default="")
# Authentication token, prefixed by Bearer: Bearer <token>. Can be created on https://aruna-storage.org/
DJANGO_UPLOAD_TOOLS_API_TOKEN = env("DJANGO_UPLOAD_TOOLS_API_TOKEN", default=None)
# Open port for communication(443)
DJANGO_UPLOAD_TOOLS_AOS_PORT = env("DJANGO_UPLOAD_TOOLS_AOS_PORT", default="")
# ID of the created AOS project
DJANGO_UPLOAD_TOOLS_PROJECT_ID = env("DJANGO_UPLOAD_TOOLS_PROJECT_ID", default="")
# The name of your project
DJANGO_UPLOAD_TOOLS_PROJECT_NAME = env("DJANGO_UPLOAD_TOOLS_PROJECT_NAME", default=None)


# Aspera Settings
# ------------------------------------------------------------------------------
ASPERA_ASCP_PATH = env.str("ASPERA_ASCP_PATH", default="/home/asperauser/.aspera/connect/bin/ascp")
S3FS_MOUNT_POINT = env.str("DJANGO_S3FS_MOUNT_POINT", default="/mnt/s3bucket")

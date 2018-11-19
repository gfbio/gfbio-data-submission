# -*- coding: utf-8 -*-
from django.conf import settings

GCDJ_BASE_URL = getattr(
    settings,
    'GCDJ_BASE_URL',
    'http://127.0.0.1:8000/{0}'
)
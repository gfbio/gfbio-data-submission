# -*- coding: utf-8 -*-

from __future__ import absolute_import, unicode_literals

settings = {}

CSV_TEMPLATE_STATIC_PATH = getattr(
    settings,
    'CSV_TEMPLATE_STATIC_PATH',
    'templates/full_template_semicolon.csv'
)

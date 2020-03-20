# -*- coding: utf-8 -*-

from __future__ import absolute_import, unicode_literals

settings = {}

CSV_TEMPLATE_STATIC_PATH = getattr(
    settings,
    'CSV_TEMPLATE_STATIC_PATH',
    'templates/full_template_semicolon.csv'
)

# TODO: not used in this way anymore, since site_config and user switched
#  foreign key relation
# User-name that identifies local site that (self-)hosts react app
# User object with this name has to exist, has to be site, token has
# to be generated
# HOSTING_SITE = getattr(
#     settings,
#     'HOSTING_SITE',
#     'local-site'
# )

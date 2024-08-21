# -*- coding: utf-8 -*-
from _csv import QUOTE_NONNUMERIC, QUOTE_NONE
from builtins import getattr

settings = {}

SYSTEM_WIDE_PROFILE_NAME_PREFIX = getattr(settings, "SYSTEM_WIDE_PROFILE_NAME_PREFIX", "system")

DEFAULT_PROFILE_NAME = getattr(settings, "DEFAULT_PROFILE_NAME", "gfbio")

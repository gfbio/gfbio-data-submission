# -*- coding: utf-8 -*-
import json
from functools import lru_cache

from django import template
from django.contrib.staticfiles import finders
from django.templatetags.static import static
from django.utils.safestring import mark_safe


register = template.Library()


@lru_cache(maxsize=8)
def _load_manifest(manifest_path):
    manifest_file = finders.find(manifest_path)
    if not manifest_file:
        return {}
    with open(manifest_file, "r", encoding="utf-8") as handle:
        return json.load(handle)


@register.simple_tag
def vite_entry(entry_name, manifest_path="js/curator-ui/manifest.json"):
    manifest = _load_manifest(manifest_path)
    entry = manifest.get(entry_name, {})

    tags = []
    for css_file in entry.get("css", []):
        tags.append('<link rel="stylesheet" crossorigin href="{}">'.format(static(f"js/{css_file}")))

    js_file = entry.get("file")
    if js_file:
        tags.append('<script type="module" crossorigin src="{}"></script>'.format(static(f"js/{js_file}")))

    return mark_safe("\n".join(tags))

import json

from django.core.serializers.json import DjangoJSONEncoder


def diff_submission_data(old, new):
    """Return added, removed, and changed entries for two submission data values.

    Both dicts are walked by key. A dict that appears or disappears as a whole
    stays one entry. Lists and scalars are one value. An empty path means the
    root itself changed and is displayed as "data".
    """
    added = []
    removed = []
    changed = []
    if isinstance(old, dict) and isinstance(new, dict):
        _diff_dicts(old, new, [], added, removed, changed)
    elif old != new:
        changed.append({"path": [], "old": old, "new": new})
    added.sort(key=lambda item: item["path"])
    removed.sort(key=lambda item: item["path"])
    changed.sort(key=lambda item: item["path"])
    return {"added": added, "removed": removed, "changed": changed}


def display_diff_path(path):
    """Join path keys with dots. An empty path is the submission data root."""
    if not path:
        return "data"
    return ".".join(str(segment) for segment in path)


def format_diff_value(value):
    """Serialize one diff value so null, false, 0, and their string forms stay distinct."""
    return json.dumps(value, indent=2, ensure_ascii=False, sort_keys=True, cls=DjangoJSONEncoder)


def _diff_dicts(old, new, path, added, removed, changed):
    for key in old.keys() - new.keys():
        removed.append({"path": [*path, key], "value": old[key]})
    for key in new.keys() - old.keys():
        added.append({"path": [*path, key], "value": new[key]})
    for key in old.keys() & new.keys():
        old_value = old[key]
        new_value = new[key]
        if old_value == new_value:
            continue
        child_path = [*path, key]
        if isinstance(old_value, dict) and isinstance(new_value, dict):
            _diff_dicts(old_value, new_value, child_path, added, removed, changed)
        else:
            changed.append({"path": child_path, "old": old_value, "new": new_value})

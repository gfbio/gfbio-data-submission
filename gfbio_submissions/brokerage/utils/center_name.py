# -*- coding: utf-8 -*-
from ..exceptions.transfer_exceptions import InvalidCenterName


def resolve_and_validate_center_name(submission):
    """Resolve a submission's curated ENA center name and reject empties.

    The controlled vocabulary is the ``CenterName`` DB table; the FK
    structurally guarantees membership, so this guard only has to reject a
    missing (``None``) or empty/whitespace-only centre. On success it returns
    the stored ``center_name`` string; otherwise it raises
    :class:`InvalidCenterName` (a hard fail, never a fallback substitution).
    """
    if submission.center_name is None:
        raise InvalidCenterName(submission.id, "no center_name assigned")
    if submission.center_name.center_name.strip() == "":
        raise InvalidCenterName(submission.id, "center_name is empty")
    return submission.center_name.center_name

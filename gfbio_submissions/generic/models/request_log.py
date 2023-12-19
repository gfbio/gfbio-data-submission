import logging
import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from config.settings.base import AUTH_USER_MODEL

from ..fields import JsonDictField
from ..managers import RequestLogManager

logger = logging.getLogger(__name__)


# TODO: review and refactor fields
class RequestLog(TimeStampedModel):
    INCOMING = "0"
    OUTGOING = "1"
    JIRA = "2"
    REQUEST_TYPES = (
        (INCOMING, "incoming"),
        (OUTGOING, "outgoing"),
        (JIRA, "jira"),
    )
    NONE = 0
    POST = 1
    GET = 2
    PUT = 3
    PATCH = 4
    DELETE = 5
    METHOD_TYPES = (
        (NONE, "not available"),
        (POST, "POST"),
        (GET, "GET"),
        (PUT, "PUT"),
        (PATCH, "PATCH"),
        (DELETE, "DELETE"),
    )
    request_id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        help_text="Primary-key for RequestLog entries",
    )
    type = models.CharField(
        max_length=1,
        choices=REQUEST_TYPES,
        default=INCOMING,
        help_text="We separate incoming and outgoing requests",
    )
    method = models.IntegerField(choices=METHOD_TYPES, default=NONE, help_text="Http method used, if available")
    url = models.TextField(help_text="Target url of this Request", blank=True)
    data = models.TextField(
        blank=True,
        help_text="Any kind of payload that comes with this request (if available)",
    )

    # TODO: is Textfield the rigth choice for file
    files = models.TextField(
        blank=True,
        help_text="Log potential file-data. Explicitly introduced to log requests-library file keyword",
    )

    json = JsonDictField(
        default=dict,
        help_text="Log potential json-data. Explicitly introduced to log requests-library json keyword",
    )

    # TODO: refactor too when changing ownership
    # TODO: keeping it for legacy data
    site_user = models.CharField(
        max_length=72,
        help_text="A user of a site registered in our System. E.g. user=joe (this value ...) at site=GFBio.org",
    )
    user = models.ForeignKey(
        AUTH_USER_MODEL,
        null=True,
        blank=True,
        related_name="user_requestlogs",
        on_delete=models.SET_NULL,
    )
    submission_id = models.UUIDField(
        null=True,
        blank=True,
        help_text="The submission this request is associated with",
    )
    response_status = models.IntegerField(
        null=True,
        blank=True,
        help_text=(
            "The response-code we send if this is an incoming request. Otherwise the status sent by request-target"
        ),
    )
    response_content = models.TextField(
        blank=True,
        help_text="The content we send if this is an incoming request. Otherwise the content sent by request-target",
    )
    triggered_by = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        help_text=(
            "This will be null for incoming requests Otherwise (outgoing request) it will show the id of the incoming "
            "request, that has triggered this request"
        ),
        on_delete=models.SET_NULL,
    )
    request_details = JsonDictField(
        default=dict,
        help_text="This may contain meta-information regarding this request",
    )

    objects = RequestLogManager()

    def __str__(self):
        return "{}".format(self.request_id)

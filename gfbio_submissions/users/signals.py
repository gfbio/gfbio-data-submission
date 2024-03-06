from django.contrib import messages
from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.utils.safestring import mark_safe


@receiver(user_logged_in)
def handle_user_login(sender, user, request, **kwargs):
    # Generate a Django message with a hint text
    messages.info(
        request,
        mark_safe(
            "2024-03-06: The submission service is currently unavailable for submissions involving molecular data. "
            "This includes creating new molecular submissions, setting or modifying embargo dates of brokered "
            "molecular submissions, and working on processing molecular submissions. <br /><br />"
            "We apologize for any inconvenience and are working to have the service running soon."
        ),
    )

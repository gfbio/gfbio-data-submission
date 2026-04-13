from django.shortcuts import redirect


def submission_update_ui_redirect_view(request, submission_id):
    return redirect('update_submission_ui', submission_id=submission_id)
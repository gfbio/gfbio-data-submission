# -*- coding: utf-8 -*-
import os

from django.core.management.base import BaseCommand

from gfbio_submissions.generic.models import RequestLog


class Command(BaseCommand):
    help = (
        "Read part of sql dump with legacy brokerage.RequestLog data "
        "and save created date to generic.RequestLog when id matches"
    )

    def add_arguments(self, parser):
        parser.add_argument("file", type=str)

    def handle(self, *args, **kwargs):
        if os.path.exists(kwargs["file"]):
            with open(kwargs["file"], "r") as file:
                for f in file.readlines():
                    if f.startswith("COPY public.brokerage_requestlog"):
                        print(f)
                    row = f.split("\t")
                    if len(row) == 12:
                        request_id = row[0]
                        # FIXME: this is just a hack. check column order ..
                        # pre timestamped model names
                        changed = row[-2]
                        created = row[-3]
                        try:
                            r = RequestLog.objects.get(request_id=request_id)
                            print(
                                "Found RequestLog for request_id:",
                                request_id,
                                " object.created data: ",
                                r.created,
                                " | change to: ",
                                created,
                                " ...",
                            )
                            r.created = created
                            r.save()
                            print("\t... done.")
                        except RequestLog.DoesNotExist as e:
                            pass
        else:
            print('File not found: "{}"'.format(kwargs["file"]))

# -*- coding: utf-8 -*-
import os

from django.conf import settings
from rest_framework import permissions


class APIAllowedHosts(permissions.BasePermission):
    """
    Ensure the request's IP address is on the safe list configured in Django settings.
    """

    # recursive method to get all IP addresses from domain name
    def get_ip_from_domain(self, domain_name):
        # FIXME: I do not like this
        stream = os.popen("dig +short {}".format(domain_name))
        results = []
        domain_records_list = stream.read().split("\n")  # list of CNAME and A records
        for record in domain_records_list:
            record = record.lower()
            if len(record) > 0:  # ignore empty values that come after split \n
                if not record.islower():  # if it's IP
                    results.append(record)
                else:  # if it's CNAME record, get IPs
                    results.extend(self.get_ip_from_domain(record))
        return results

    # check if domain is allowed to use REST API
    def has_permission(self, request, view):
        # get list of allowed IPs
        allowed_ip_list = settings.REST_SAFE_LIST_IPS
        # get IPs for allowed domains
        for domain in settings.REST_SAFE_DOMAINS:
            allowed_ip_list.extend(self.get_ip_from_domain(domain))
        # remove duplicated ip addresses
        allowed_ip_list = list(set(allowed_ip_list))
        remote_addr = None
        if "HTTP_X_REAL_IP" in request.META:
            remote_addr = request.META["HTTP_X_REAL_IP"]  # traefik reverse proxy header for staging and live systems
        else:
            remote_addr = request.META["REMOTE_ADDR"]  # for local purposes
        if remote_addr:
            for valid_ip in allowed_ip_list:
                if remote_addr == valid_ip or remote_addr.startswith(valid_ip):
                    return True

        return False

# -*- coding: utf-8 -*-

import unicodedata


# TODO: works, but username is in capital letters ? maybe css ?
def generate_username(email):
    # Using Python 3 and Django 1.11, usernames can contain alphanumeric
    # (ascii and unicode), _, @, +, . and - characters. So we normalize
    # it and slice at 150 characters.
    return unicodedata.normalize("NFKC", email)[:150]

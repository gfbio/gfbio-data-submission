import re


id_regex = re.compile(r"http.*\/(?P<ontology>\w+)\_(?P<id>\d+)\/?$")

def get_short_id(url):
    id_matches = id_regex.match(url)
    if id_matches:
        return id_matches.group("ontology") + ":" + id_matches.group("id")
    else:
        return "-"

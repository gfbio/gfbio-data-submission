import urllib

from django.conf import settings
from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.utils import get_short_id
from django.core.cache import cache

from gfbio_submissions.generic.utils import logged_requests



class OntologyRequester:
    def request_ontology_entries(self, name, ontology=None, root=None):
        url = settings.ONTO_PORTAL_URL + f"/search?include=prefLabel,synonym,definition,notation&require_exact_match=true&q={name}"
        if ontology:
            url += f"&ontology={ontology}"
        if root:
            url += f"&subtree_root_id={urllib.parse.quote(root)}"
        response = logged_requests.get(url, headers={"Authorization": f"apikey token={settings.ONTO_PORTAL_API_KEY}"})
        if response.status_code != 200:
            msg = f"Can't access the Onto-portal (Code {response.status_code})."
            try:
                msg += " Message: " + response.json()["error"]
            except Exception:
                msg += " Please check request-log."
            if not settings.ONTO_PORTAL_API_KEY:
                msg += " Please set the API-Key for the onto-portal in the settings."
            raise Exception(msg)
        result = response.json()
        return [
            {
                "prefLabel": res["prefLabel"],
                "names": [res["prefLabel"]] + (res["synonym"] if "synonym" in res else []),
                "id": get_short_id(res["@id"]),
                "iri": res["@id"]
            }
            for res in result["collection"][0:3] if get_short_id(res["@id"]) != "-"
        ]


class OntologyRequesterCacheWrapper():
    def __init__(self, wrapped):
        self.time_out = settings.ONTOLOGY_CACHE_TIMEOUT
        self.wrapped = wrapped

    def request_ontology_entries(self, name, ontology=None, root=None):
        cache_key = self.create_key(name, ontology, root)
        result = cache.get_or_set(
            cache_key,
            lambda: self.wrapped.request_ontology_entries(name, ontology, root),
            timeout=self.time_out
        )
        return result

    def create_key(self, name, ontology, root):
        return f"ontology_res_{name.replace(' ', '+')}_{ontology if ontology else 'no_ont'}_{root.split('/')[-1] if root else 'no_root'}"
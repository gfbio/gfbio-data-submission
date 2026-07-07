import re

from gfbio_submissions.brokerage.tasks.metadata_tasks.envo_validation.utils import get_short_id


class OntologyMatcher:
    def __init__(self, ontology_requester, root_name=None, root=None, ontology=None):
        self.ontology_requester = ontology_requester
        self.root = root
        self.root_name = root_name
        self.ontology = ontology

    def get_match(self, provided_name, provided_id):
        ontology = self.ontology
        if provided_id:
            ontology = provided_id.split(":")[0]
            if self.ontology and ontology != self.ontology:
                return None, {
                    "msg": f"The id {provided_id} of {provided_name} does not match the required Ontology {self.ontology}.", 
                    "help_text": f"Please choose a term from the Ontology {self.ontology}.",
                    "status": "ERROR",
                }
        collection = self.ontology_requester.request_ontology_entries(provided_name, ontology=ontology, root=self.root)
        return self.match_collection_to_search_term(collection, provided_name)

    def match_collection_to_search_term(self, collection, provided_name):
        if collection:
            matches = [res for res in collection if provided_name in res["names"]]
            if len(matches) == 1:
                return matches[0], None
            elif len(matches) > 1:
                examples = ', '.join([f"'{res['prefLabel']} [{res['id']}]'" for res in matches])
                return None, {
                    "msg": f"There are mulitple possible matches for '{provided_name}'. E.g. {examples}...",
                    "help_text": "Please set the format to 'the terminology [ONTO:12345]' to remove all ambiguity.",
                    "status": "ERROR",
                }
            elif len(matches) == 0 and len(collection) > 0:
                examples = ', '.join([f"'{res['prefLabel']} [{res['id']}]'" for res in collection])
                return None, {
                    "msg": f"There is no exact match for '{provided_name}', but mulitple possible matches, e.g. {examples}...",
                    "help_text": "Please choose maybe one them and set the format to 'the terminology [ONTO:12345]' to remove all ambiguity.",
                    "status": "ERROR",
                }

        msg=f"Can't find matching term for '{provided_name}'."
        if self.root:
            msg += f" Please ensure the term is a decendant of {self.root_name} [{get_short_id(self.root)}]."
        return None, {"msg": msg, "help_text": "Please double-check the spelling of the term.", "status": "ERROR",}


class MediumOntologyMatcher(OntologyMatcher):
    def __init__(self, ontology_requester, root_name=None, root=None, ontology=None):
        super().__init__(ontology_requester, root_name, root, ontology)

    def match_collection_to_search_term(self, collection, provided_name):
        primary_result, primary_result_msg = super().match_collection_to_search_term(collection, provided_name)
        if primary_result != None:
            return primary_result, primary_result_msg
        else:
            broader_collection = self.ontology_requester.request_ontology_entries(provided_name, self.ontology, root=None)
            if broader_collection:
                matches = [res for res in broader_collection if provided_name in res["names"]]
                if len(matches) == 1:
                    return matches[0], {
                        "msg": f"'{provided_name}' is not a decendant of {self.root_name} [{get_short_id(self.root)}], which we dicourage.",
                        "help_text": f"Please consider using a decendant of {self.root_name} [{get_short_id(self.root)}].",
                        "status": "WARNING",
                    }
        return primary_result, primary_result_msg

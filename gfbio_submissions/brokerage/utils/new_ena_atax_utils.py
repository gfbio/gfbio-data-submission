import requests


def query_ena_for_taxid(taxid):
    """
    Query ENA for taxid and check if the result is submittable
    """
    url = "https://www.ebi.ac.uk/ena/taxonomy/rest/tax-id/" + taxid
    response = requests.get(url)
    if response.status_code == 200:
        response = response.json()
        if response["submittable"] == "true":
            return response
        else:
            return None
    else:
        return None


def query_ena_for_scientific_name(scientific_name):
    """
    Query ENA for scientific name and check if the result is submittable
    """
    url = "https://www.ebi.ac.uk/ena/taxonomy/rest/scientific-name/" + requests.utils.quote(scientific_name)
    response = requests.get(url)
    if response.status_code == 200:
        response = response.json()
        if response and response[0]["submittable"] == "true":
            return response[0]
    return None


def query_ena(data, submission_target):
    """
    Query ENA for the given data, based on the submission target
    """
    if submission_target == "ena":
        return query_ena_for_taxid(data)
    elif submission_target == "atx":
        return query_ena_for_scientific_name(data)
    else:
        return None

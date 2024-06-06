import requests

from gfbio_submissions.brokerage.configuration.settings import ATAX, ENA, ENA_TAXONOMY_URL_PREFIX


# query ENA for the taxid and check if the result is submittable
def query_ena_for_taxid(taxid):
    url = ENA_TAXONOMY_URL_PREFIX + "tax-id/" + taxid
    response = requests.get(url)
    if response.status_code == 200:
        response = response.json()
        if response["submittable"] == "true":
            return response
        else:
            return None
    else:
        return None


# query ENA for the scientific name and check if the result is submittable
def query_ena_for_scientific_name(scientific_name):
    url = ENA_TAXONOMY_URL_PREFIX + "scientific-name/" + requests.utils.quote(scientific_name)
    response = requests.get(url)
    if response.status_code == 200:
        response = response.json()
        if response and response[0]["submittable"] == "true":
            return response[0]
    return None


def query_ena(data, submission_target):
    """Query ENA for the given data, based on the submission target

    Args:
        data (str): the data to query
        submission_target (str): the submission target, should be "ena" or "atax"

    Returns:
        ENA response or None: the response from ENA or None if the data is not submittable
    """
    if submission_target == ENA:
        return query_ena_for_taxid(data)
    elif submission_target == ATAX:
        return query_ena_for_scientific_name(data)
    else:
        return None

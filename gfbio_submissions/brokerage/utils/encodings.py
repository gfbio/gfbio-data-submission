import logging

from charset_normalizer import from_path

logger = logging.getLogger(__name__)

# The only text encodings our users realistically produce: UTF-8 (covers ASCII)
# and Excel-on-Windows' Windows-1252. Restricting charset detection to this set
# keeps it deterministic for our domain - unconstrained detection guesses exotic
# encodings (e.g. cp775, big5) on CSVs full of ASCII noise such as checksums and
# file names, mis-decoding the umlauts it is meant to recover. ISO-8859-1 is
# deliberately excluded: it maps all 256 bytes, so it would decode genuinely
# binary files into garbage instead of letting them fail; cp1252 already decodes
# every German umlaut while leaving a few undefined bytes that flag binary input.
CANDIDATE_ENCODINGS = ["utf_8", "cp1252"]

bom_encodings = [
    {
        "bom": [239, 187, 191],
        "encoding": "utf-8-sig"
    },
    {
        "bom": [254, 255],
        "encoding": "utf-16"
    },
    {
        "bom": [255, 254],
        "encoding": "utf-16"
    }
]


def matches_bom(sample, to_match):
    if len(sample) < len(to_match):
        return False
    for i in range(0, len(to_match)):
        if (sample[i] != to_match[i]):
            return False
    return True


def sniff_encoding(path):
    # 1. A byte-order-mark is authoritative when present.
    with open(path, "rb") as to_sniff:
        start = to_sniff.read(5)
    for encoding in bom_encodings:
        if (matches_bom(start, encoding["bom"])):
            return encoding["encoding"]

    # 2. No BOM: detect statistically among the candidate encodings. Excel on
    #    Windows saves CSV as Windows-1252 without a BOM, which the BOM check
    #    alone cannot catch.
    try:
        best_match = from_path(path, cp_isolation=CANDIDATE_ENCODINGS).best()
    except Exception as e:  # pragma: no cover - defensive, charset_normalizer is robust
        logger.warning("sniff_encoding: charset detection failed for '%s': %s", path, e)
        best_match = None
    if best_match is not None:
        return best_match.encoding

    # 3. Explicit final fallback (never return None and let callers guess).
    return "utf-8"

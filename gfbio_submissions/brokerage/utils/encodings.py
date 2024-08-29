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
    for i in range(0, len(to_match)):
        if (sample[i] != to_match[i]):
            return False
    return True


def sniff_encoding(path):
    with open(path, "rb") as to_sniff:
        start = to_sniff.read(5)
        for encoding in bom_encodings:
            if (matches_bom(start, encoding["bom"])):
                return encoding["encoding"]
        return None
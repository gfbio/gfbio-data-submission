# -*- coding: utf-8 -*-
import collections


def flatten_key_with_array_value(key, array_value, separator="_"):
    return [("{0}{1}{2}".format(key, separator, i), array_value[i]) for i in range(0, len(array_value))]


# TODO: used by pangaea utils to add gcdj information to samples
def flatten_dictionary(dictionary, parent_key="", separator="_"):
    items = []
    for k, v in dictionary.iteritems():
        new_key = parent_key + separator + k if parent_key else k
        if isinstance(v, collections.MutableMapping):
            items.extend(flatten_dictionary(v, new_key, separator=separator).items())
        else:
            items.append((new_key, v)) if not isinstance(v, list) else items.extend(
                flatten_key_with_array_value(new_key, v, separator)
            )
    return collections.OrderedDict(items)

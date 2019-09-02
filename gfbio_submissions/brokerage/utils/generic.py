# -*- coding: utf-8 -*-

# logger = logging.getLogger(__name__)
# SOID_KEY = 'site_object_id'
#
#
# def encode_object_id(object_name, encode_value):
#     return '{}_{}'.format(object_name, base64.urlsafe_b64encode(encode_value))
#
#
# def append_site_object_id(data, id):
#     data['site_object_id'] = id


# def create_dummy_gfbio_project_id():
#     return encode_object_id('gfbio_project', str(time.time()))


# def generic_site_object_id_service():
#     # This here implies site_object_ids are available in data, so do nothing
#     pass

# # TODO: this could be placed in Brokermodel manager
# def dummy_site_object_id_service(broker_object_set):
#     time_stamp = str(time.time())
#     for a, b in BrokerObject.ENTITY_TYPES:
#         index = 0
#         for broker_object in broker_object_set.filter(type=b):
#             broker_object.site_project_id = encode_object_id('project',
#                                                              time_stamp)
#             soid = encode_object_id('{0}_{1}'.format(b, index), time_stamp)
#             # TODO: check if the soid is needed in the actual data
#             broker_object.data[SOID_KEY] = soid
#             broker_object.site_object_id = soid
#             index += 1
#             broker_object.save()

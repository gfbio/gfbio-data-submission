# -*- coding: utf-8 -*-
import json
from collections import OrderedDict

import six
from django import forms
from django.contrib.postgres.fields import JSONField
from django.core.serializers.json import DjangoJSONEncoder


# adapted from: https://github.com/yjmade/django-pgjsonb/blob/master/django_pgjsonb/fields.py
class JsonDictField(JSONField):
    def __init__(self, *args, **kwargs):
        self.decode_kwargs = kwargs.pop('decode_kwargs', {
            # 'parse_float': decimal.Decimal
        })
        self.encode_kwargs = kwargs.pop('encode_kwargs', {
            'cls': DjangoJSONEncoder,
        })
        db_index = kwargs.get("db_index")
        db_index_options = kwargs.pop("db_index_options", {})
        if db_index:
            self.db_index_options = db_index_options if isinstance(
                db_index_options, (list, tuple)) else [db_index_options]

            kwargs[
                "db_index"] = False  # to supress the system default create_index_sql
        super(JsonDictField, self).__init__(*args, **kwargs)

    def get_prep_value(self, value):
        if value is None:
            if not self.null and self.blank:
                return ""
            return None
        return json.dumps(value, **self.encode_kwargs)

    def from_db_value(self, value, expression, connection):
        if value is not None:
            # this if will take care of legacy db content
            if type(value) is not dict:
                value = json.loads(value, **self.decode_kwargs)
        return value

    def to_python(self, value):
        if value is None and not self.null and self.blank:
            return ''
        # Rely on psycopg2 to give us the value already converted.
        return value


class OrderedJsonFormField(forms.CharField):
    empty_values = [None, '']

    def __init__(self, *args, **kwargs):
        # if 'widget' not in kwargs:
        #     kwargs['widget'] = JSONWidget
        super(OrderedJsonFormField, self).__init__(*args, **kwargs)

    def to_python(self, value):
        if isinstance(value, six.string_types) and value:
            try:
                return json.JSONDecoder(object_pairs_hook=OrderedDict).decode(
                    value)
            except ValueError as exc:
                raise forms.ValidationError(
                    'gcdjson: JSON decode error: {0}'.format(
                        six.u(exc.args[0]), )
                )
        else:
            return value

    def validate(self, value):
        # This is required in older django versions.
        if value in self.empty_values and self.required:
            raise forms.ValidationError(self.error_messages['required'],
                                        code='required')

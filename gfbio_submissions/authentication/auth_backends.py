# -*- coding: utf-8 -*-
import logging
import unicodedata

from mozilla_django_oidc.auth import OIDCAuthenticationBackend

logger = logging.getLogger(__name__)


class GFBioAuthenticationBackend(OIDCAuthenticationBackend):

    def verify_claims(self, claims):
        verified = super(GFBioAuthenticationBackend, self).verify_claims(claims)
        logger.info('GFBioAuthenticationBackend | verify_claims | email={0}  | '
                    'verified={1}'.format(
            claims.get('email', 'NO_EMAIL_IN_CLAIM'), verified))
        return verified

    def get_username(self, claims):
        username = claims.get(
            'preferred_username',
            claims.get('email')
        )
        return unicodedata.normalize('NFKC', username)[:150]

    def create_user(self, claims):
        user = super(GFBioAuthenticationBackend, self).create_user(claims)
        user.goesternid = claims.get('goe_id', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | create_user | email={0}  | '
                    'goesternid={1}'.format(
            claims.get('email', 'NO_EMAIL_IN_CLAIM'),
            claims.get('goesternid', 'NO_GOESTERNID_IN_CLAIM'))
        )
        return user

    def update_user(self, user, claims):
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.email = claims.get('email', '')
        user.goesternid = claims.get('goe_id', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | update_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        return user

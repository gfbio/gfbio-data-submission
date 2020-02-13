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
        # TODO: gdwg sso only provides cryptic user names
        # username = claims.get(
        #     'preferred_username',
        #     claims.get('email')
        # )
        username = claims.get('email')

        logger.info(
            'GFBioAuthenticationBackend | get_username | username={0}  | '
            ''.format(username))
        return unicodedata.normalize('NFKC', username)[:150]

    def create_user(self, claims):
        logger.info('GFBioAuthenticationBackend | create_user | claims={0}  | '
                    ''.format(claims))
        user = super(GFBioAuthenticationBackend, self).create_user(claims)

        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.name = '{0} {1}'.format(claims.get('given_name', ''),
                                     claims.get('family_name', '')).strip()
        user.email = claims.get('email', '')

        user.external_user_id = claims.get('goe_id', '')
        logger.info(
            'GFBioAuthenticationBackend | create_user | user={0} | '
            'external_user_id={1} (goesternid) |'
            ''.format(user, user.external_user_id))
        user.save()
        logger.info('GFBioAuthenticationBackend | create_user | email={0}  | '
                    'external_user_id={1} (goesternid)'.format(
            claims.get('email', 'NO_EMAIL_IN_CLAIM'),
            claims.get('external_user_id', 'NO_GOESTERNID_IN_CLAIM'))
        )
        return user

    def update_user(self, user, claims):
        logger.info(
            'GFBioAuthenticationBackend | update_user | claims={0}  | user={1}'
            ''.format(claims, user))
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.name = '{0} {1}'.format(claims.get('given_name', ''),
                                     claims.get('family_name', '')).strip()
        user.email = claims.get('email', '')
        user.external_user_id = claims.get('goe_id', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | update_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        return user

# -*- coding: utf-8 -*-
import logging

from mozilla_django_oidc.auth import OIDCAuthenticationBackend

logger = logging.getLogger(__name__)


class GFBioAuthenticationBackend(OIDCAuthenticationBackend):

    # TODO: verfiy is called before create_user and update_user
    # {'sub': 'marc.weber01@gwdg.de', 'email': 'maweber@mpi-bremen.de',
    # 'family_name': 'Weber', 'given_name': 'Marc', 'preferred_username':
    # 'marc.weber01', 'goe_id': '0404134'}
    def verify_claims(self, claims):
        verified = super(GFBioAuthenticationBackend, self).verify_claims(claims)
        logger.info('GFBioAuthenticationBackend | verify_claims | email={0}  | '
                    'verified={1}'.format(
            claims.get('email', 'NO_EMAIL_IN_CLAIM'), verified))
        return verified

    # TODO: called on very first login via SSO
    def create_user(self, claims):
        user = super(GFBioAuthenticationBackend, self).create_user(claims)
        user.save()
        logger.info('GFBioAuthenticationBackend | create_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        return user

    # TODO: called on login as returning user
    def update_user(self, user, claims):
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | update_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        return user

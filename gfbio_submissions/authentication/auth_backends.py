# -*- coding: utf-8 -*-
import logging

from mozilla_django_oidc.auth import OIDCAuthenticationBackend

logger = logging.getLogger(__name__)


# from myapp.models import Profile

class GFBioAuthenticationBackend(OIDCAuthenticationBackend):

    def verify_claims(self, claims):
        verified = super(GFBioAuthenticationBackend, self).verify_claims(claims)
        logger.info(
            '\n######### GFBioAuthenticationBackend | verify_claims | claims ############\n')
        logger.info('type: {0}'.format(type(claims)))
        logger.info(claims)
        logger.info('\n################################\n')
        # is_admin = 'admin' in claims.get('group', [])
        # return verified and is_admin
        return True

    def create_user(self, claims):
        user = super(GFBioAuthenticationBackend, self).create_user(claims)

        # user.first_name = claims.get('given_name', '')
        # user.last_name = claims.get('family_name', '')
        user.save()
        logger.info(
            '\n######### GFBioAuthenticationBackend | create_user | claims ############\n')
        logger.info('type: {0}'.format(type(claims)))
        logger.info(claims)
        logger.info('\n################################\n')

        return user

    def update_user(self, user, claims):
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.save()
        logger.info(
            '\n######### GFBioAuthenticationBackend | update_user | claims ############\n')
        logger.info('type: {0}'.format(type(claims)))
        logger.info(claims)
        logger.info('\n################################\n')

        return user

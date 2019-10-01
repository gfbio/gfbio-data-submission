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
        print('VERIFY_CLAIMS claims')
        print(claims)
        print()
        return verified


    # TODO:
    #   - check if gfbio sso, else default oidc for max. compatibility (curently only gfbio-sso via setings)
    #   - overide get_username ?
    #   - add additional generate_username algo for gfbio-sso, all others use generate_username with email
    #   OIDC_OP_AUTHORIZATION_ENDPOINT = "https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php"
    #   OIDC_OP_TOKEN_ENDPOINT = "https://sso.gfbio.org/simplesaml/module.php/oidc/access_token.php"
    #   OIDC_OP_USER_ENDPOINT = " https://sso.gfbio.org/simplesaml/module.php/oidc/userinfo.php"


    # TODO: called on very first login via SSO
    def create_user(self, claims):
        user = super(GFBioAuthenticationBackend, self).create_user(claims)
        user.save()
        logger.info('GFBioAuthenticationBackend | create_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        print('CREATE_USER claims')
        print(claims)
        print()
        return user

    # TODO: called on login as returning user
    def update_user(self, user, claims):
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | update_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        print('UDPATE_USER claims')
        print(claims)
        print()
        return user

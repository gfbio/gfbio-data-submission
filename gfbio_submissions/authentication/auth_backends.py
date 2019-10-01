# -*- coding: utf-8 -*-
import logging

import unicodedata
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
        # print('VERIFY_CLAIMS claims')
        # print(claims)
        # print()
        return verified

    # TODO:
    #   - check if gfbio sso, else default oidc for max. compatibility (curently only gfbio-sso via setings)
    #   - overide get_username ?
    #   - add additional generate_username algo for gfbio-sso, all others use generate_username with email
    # TODO:
    #   - add geosternid att. to user (can be empty/Null) #
    #   - check here in create user, if existing map or error
    #   - now username is unique, email too ? email is mapped if existing ?
    #   - if geostern id is used, than unique username should not be mandatory ? #
    #   --> only one email for sso created users - replace existing one
    #   --> unique username for sso users too

    # signup -> "Es ist bereits jemand mit dieser E-Mail-Adresse registriert."
    #   1. wird eine bestehende email geändert sollte das keine Problem mehr darstellen. CHECK !
    #   2. existier die email nicht -> kein Problem
    #   3. via admin 1 email für mehrere Benutzer möglich
    #   4. wenn email via accounts/email/ aus profile entfernt wird: wird wieder frei siehe 1

    # signup -> "Dieser Benutzername ist bereits vergeben."
    #   1. nutzername ist unique, geht nicht anders

    def get_username(self, claims):
        print('MY GET_USERNAME ', claims)
        # username_algo = self.get_settings('OIDC_USERNAME_ALGO', None)
        #
        # if username_algo:
        #     if isinstance(username_algo, six.string_types):
        #         username_algo = import_string(username_algo)
        #     return username_algo(claims.get('email'))
        # return default_username_algo(claims.get('email'))
        username = claims.get(
            'preferred_username',
            claims.get('email')
        )
        return unicodedata.normalize('NFKC', username)[:150]

    # TODO: called on very first login via SSO
    def create_user(self, claims):
        user = super(GFBioAuthenticationBackend, self).create_user(claims)
        user.goesternid = claims.get('goe_id', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | create_user | email={0}  | '
                    'goesternid={1}'.format(
            claims.get('email', 'NO_EMAIL_IN_CLAIM'),
            claims.get('goesternid', 'NO_GOESTERNID_IN_CLAIM'))
        )
        print('CREATE_USER claims')
        print(claims)
        print()
        return user

    # TODO: called on login as returning user
    def update_user(self, user, claims):
        print('UDPATE_USER claims')
        print(claims)
        print('user ', user, ' ', user.pk, ' goe', user.goesternid)
        user.first_name = claims.get('given_name', '')
        user.last_name = claims.get('family_name', '')
        user.email = claims.get('email', '')
        # if user.goesternid is None or user.goesternid == '':
        user.goesternid = claims.get('goe_id', '')
        user.save()
        logger.info('GFBioAuthenticationBackend | update_user | email={0}  | '
                    ''.format(claims.get('email', 'NO_EMAIL_IN_CLAIM')))
        print('UDPATE_USER claims')
        print(claims)
        print('user ', user, ' ', user.pk)
        return user

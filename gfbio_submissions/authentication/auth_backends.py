# -*- coding: utf-8 -*-
import logging

from mozilla_django_oidc.auth import OIDCAuthenticationBackend

from gfbio_submissions.users.models import User

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

    # VERIFY_CLAIMS claims
    # django_1_b8ce6cc38c7a | {'sub': 'ivaylo.kostadinov@gwdg.de', 'email': 'ikostadi@gfbio.org', 'family_name': 'Kostadinov', 'given_name': 'Ivaylo', 'preferred_username': 'ivaylo.kostadinov', 'goe_id': '0404130'}
    # django_1_b8ce6cc38c7a |
    # django_1_b8ce6cc38c7a | INFO 2019-10-01 09:56:29,042 auth_backends 23 139730797817160 GFBioAuthenticationBackend | verify_claims | email=ikostadi@gfbio.org  | verified=True
    # django_1_b8ce6cc38c7a | UDPATE_USER claims
    # django_1_b8ce6cc38c7a | {'sub': 'ivaylo.kostadinov@gwdg.de', 'email': 'ikostadi@gfbio.org', 'family_name': 'Kostadinov', 'given_name': 'Ivaylo', 'preferred_username': 'ivaylo.kostadinov', 'goe_id': '0404130'}
    # django_1_b8ce6cc38c7a |
    # django_1_b8ce6cc38c7a | INFO 2019-10-01 09:56:29,052 auth_backends 23 139730797817160 GFBioAuthenticationBackend | update_user | email=ikostadi@gfbio.org  |
    #
    #
    # celerybeat_1_cfec7b901420 | [2019-10-01 09:59:23,476: INFO/MainProcess] Writing entries...
    # celerybeat_1_cfec7b901420 | [2019-10-01 10:02:23,838: INFO/MainProcess] Writing entries...
    # celerybeat_1_cfec7b901420 | [2019-10-01 10:05:24,187: INFO/MainProcess] Writing entries...
    #
    #
    # django_1_b8ce6cc38c7a | INFO 2019-10-01 10:06:08,962 auth_backends 23 139730797817160 GFBioAuthenticationBackend | verify_claims | email=maweber@mpi-bremen.de  | verified=True
    # django_1_b8ce6cc38c7a | VERIFY_CLAIMS claims
    # django_1_b8ce6cc38c7a | {'sub': 'marc.weber01@gwdg.de', 'email': 'maweber@mpi-bremen.de', 'family_name': 'Weber', 'given_name': 'Marc', 'preferred_username': 'marc.weber01', 'goe_id': '0404134'}
    # django_1_b8ce6cc38c7a |
    # django_1_b8ce6cc38c7a | INFO 2019-10-01 10:06:08,974 auth_backends 23 139730797817160 GFBioAuthenticationBackend | update_user | email=maweber@mpi-bremen.de  |
    # django_1_b8ce6cc38c7a | UDPATE_USER claims
    # django_1_b8ce6cc38c7a | {'sub': 'marc.weber01@gwdg.de', 'email': 'maweber@mpi-bremen.de', 'family_name': 'Weber', 'given_name': 'Marc', 'preferred_username': 'marc.weber01', 'goe_id': '0404134'}

    # TODO:
    #   - check if gfbio sso, else default oidc for max. compatibility (curently only gfbio-sso via setings)
    #   - overide get_username ?
    #   - add additional generate_username algo for gfbio-sso, all others use generate_username with email
    # TODO:
    #   - add geosternid att. to user (can be empty/Null)
    #   - check here in create user, if existing map or error
    #   - now username is unique, email too ? email is mapped if existing
    #   - if geostern id is used, than unique username should not be mandatory ?

    # signup -> "Es ist bereits jemand mit dieser E-Mail-Adresse registriert."
    #   1. wird eine bestehende email geändert sollte das keine Problem mehr darstellen. CHECK !
    #   2. existier die email nicht -> kein Problem
    #   3. via admin 1 email für mehrere Benutzer möglich
    #   4. wenn email via accounts/email/ aus profile entfernt wird: wird wieder frei siehe 1

    # signup -> "Dieser Benutzername ist bereits vergeben."
    #   1. nutzername ist unique, geht nicht anders


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
        print('EMAILs')

        emails = User.objects.filter(is_active=True).values_list('email',
                                                                 flat=True)
        print(emails)
        print()
        return user

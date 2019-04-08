# OpenID

copied Link:
        
        https://c103-171.cloud.gwdg.de/accounts/openid/login/?process=login&openid=https%3A%2F%2Fsso.gfbio.org%2Fsimplesaml%2Fmodule.php%2Foidc%2Fauthorize.php
        
        http://0.0.0.0:8000/accounts/openid/login/?process=login&openid=http%3A%2F%2Fme.yahoo.com

decoded:

        https://c103-171.cloud.gwdg.de/accounts/openid/login/?process=login&openid=https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php
        
        http://0.0.0.0:8000/accounts/openid/login/?process=login&openid=http://me.yahoo.com     
   


# with nonce, as enabled by default

    https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php?redirect_uri=https%3A%2F%2Fc103-171.cloud.gwdg.de%2Foidc%2Fcallback%2F&nonce=pooEGcidgYeckTQrYzhOf1hqtaNWo4sC&scope=openid+email&state=HMjC5jzofdKpjdFMvziYTiBNrgVafwaY&response_type=code&client_id=_5a9bafe89b8d6b6fd34982130aae08a5c080bf6f75


    https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php
        ?redirect_uri=https://c103-171.cloud.gwdg.de/oidc/callback/
        &nonce=pooEGcidgYeckTQrYzhOf1hqtaNWo4sC
        &scope=openid+email
        &state=HMjC5jzofdKpjdFMvziYTiBNrgVafwaY
        &response_type=code
        &client_id=_5a9bafe89b8d6b6fd34982130aae08a5c080bf6f75

# without nonce, disabled by setting

## 1.

### start URL
    
    - 302
    - https://c103-171.cloud.gwdg.de/oidc/authenticate/ 

### redirect to
    
    - 302
    - https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php?response_type=code&client_id=_5a9bafe89b8d6b6fd34982130aae08a5c080bf6f75&scope=openid+email&redirect_uri=https%3A%2F%2Fc103-171.cloud.gwdg.de%2Foidc%2Fcallback%2F&state=lgpuYgGEiHmcYOwLb9zZ204VMEQHNlU2
    - https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php
        ?response_type=code
        &client_id=_5a9bafe89b8d6b6fd34982130aae08a5c080bf6f75
        &scope=openid+email
        &redirect_uri=https://c103-171.cloud.gwdg.de/oidc/callback/
        &state=lgpuYgGEiHmcYOwLb9zZ204VMEQHNlU2

## nicht existierender user

Es wird nach login korrekt zurückgeleitet (auf root url, wie in settings angegeben).
Es ist ein annonymer nutzer "LVDRAXWCHGCF8BCFT2OJY2TAC6K" angemeldet und auch
angelegt, mit unverified email, die der gwdg account email entspricht.

TODO: user creation anpassen    
    
## Existierender user

Das hier klappte mit gwdg account maweber@mpi-bremen.de, als zur gleichen Zeit auch
ein user mit dieser email auf dem dev server existierte. username maweberSU, superuser.

    https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php?response_type=code&client_id=_5a9bafe89b8d6b6fd34982130aae08a5c080bf6f75&scope=openid+email&redirect_uri=https%3A%2F%2Fc103-171.cloud.gwdg.de%2Foidc%2Fcallback%2F&state=L8xuC8QTGo73XQ9cIJeld56Oa6lqpogR

    https://sso.gfbio.org/simplesaml/module.php/oidc/authorize.php
        ?response_type=code
        &client_id=_5a9bafe89b8d6b6fd34982130aae08a5c080bf6f75
        &scope=openid+email
        &redirect_uri=https://c103-171.cloud.gwdg.de/oidc/callback/
        &state=L8xuC8QTGo73XQ9cIJeld56Oa6lqpogR





# SOP Add Broker Site

## Pre-requisites

1. Admin URL of Broker Installation
2. Admin permissions on the Broker Installation

## Procedure

1. Log in to Dango admin

1. Go to Users and select 'Add User'
    * add username
    * select a password (recommended: use a password manager; note password)
    * click 'Add and continue editing'
    * add contact EMail
    * [optional] add name of contact person
    * Under 'User permissions' use the filter ('submission') and add all brokerage|submission permissions
    * click 'Save'

1. generate authentication token
    1. Go to main admin interface and navigate to AUTH TOKENS -> Tokens
    1. Click 'Add Token'
    1. Select the user from the dropdown menu and click save

1. Send username, password, token to site contact person via secure measures ().  

1. [OPTIONAL] Add dedicated site-config
    1. Main admin -> Brokerage -> Site configurations
    1. 'Add site configuration'
        * select a title (recommended default: same as username)
        * select the site from the dropdown menu
        * add the contact email to 'Contact'
        * Select the appropriate Server for the different config options
        * Click 'Save'

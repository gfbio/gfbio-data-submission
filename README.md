# GFBio e.V. Submission-system

Submission services provided by GFBio e.V.

## Description

Submission services provided by GFBio e.V. and long-term data archival & publication services
for Biodiversity, Ecology & Environmental Science.
This service enables the users to submit their data for long-term storage in dedicated archives like
ENA or PANGAEA and others, without the need of performing single submissions to each of these archives 
and repositories respectively. Submission can be performed by either using web-based user-interface or a
REST API, where the latter is suitable for high-throughput programmatic submissions.

## Developer Guide

### Settings

Moved to [settings](http://cookiecutter-django.readthedocs.io/en/latest/settings.html)

### Basic Commands

#### Setting Up Your Users

* To create a **normal user account**, just go to Sign Up and fill out the form. Once you submit it, you'll see a "Verify Your E-mail Address" page. Go to your console to see a simulated email verification message. Copy the link into your browser. Now the user's email should be verified and ready to go.

* To create an **superuser account**, use this command::

    
    $ python manage.py createsuperuser

For convenience, you can keep your normal user logged in on Chrome and your superuser logged in on Firefox (or similar), so that you can see how the site behaves for both kinds of users.

#### Type checks

Running type checks with mypy:

      $ mypy gfbio_submissions


#### Test coverage

To run the tests, check your test coverage, and generate an HTML coverage report::

    $ coverage run -m pytest
    $ coverage html
    $ open htmlcov/index.html

#### Running tests with py.test

    $ pytest


### Live reloading and Sass CSS compilation

Moved to [Live reloading and SASS compilation](http://cookiecutter-django.readthedocs.io/en/latest/live-reloading-and-sass-compilation.html).


#### Celery

This app comes with Celery.

To run a celery worker:

    cd gfbio_submissions
    celery -A config.celery_app worker -l info

Please note: For Celery's import magic to work, it is important *where* the celery commands are run. If you are in the same folder with *manage.py*, you should be right.




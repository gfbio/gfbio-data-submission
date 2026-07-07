# Contributing

## Running the test suite

pytest is the canonical test runner for both local development and CI. The full
suite must pass green in a single run under randomised order:

    pytest gfbio_submissions

The run order is randomised each time (the seed is printed in the header; replay a
specific ordering with `--randomly-seed=<seed>`). `manage.py test` is no longer the
test entry point — CI runs pytest and gates on its real exit code.

## Contributors

- Marc Weber
- Deniss Marinuks
- Ivaylo Kostadinov
- Jimena Linares

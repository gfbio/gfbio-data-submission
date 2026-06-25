import inspect

import pytest
import responses
from django.core.cache import cache

from gfbio_submissions.users.models import User
from gfbio_submissions.users.tests.factories import UserFactory


def pytest_pycollect_makeitem(collector, name, obj):
    # Collect each test class ONLY in the module where it is defined. Many test
    # modules import a Test*-named TestCase from another module (for inheritance
    # or to reuse a static helper); pytest's default collection re-collects every
    # such imported class under the importing module too. Re-collecting a Django
    # TestCase under a second module runs its setUpClass/tearDownClass lifecycle
    # more than once per session, which tears down the test database mid-run and
    # cascades into empty-table / FK / "database ... does not exist" failures in
    # every later class. Skipping imported classes makes each run exactly once,
    # matching `manage.py test` discovery (which is green). DASS-3577.
    if inspect.isclass(obj) and obj.__module__ != collector.module.__name__:
        return []


@pytest.fixture(autouse=True, scope="session")
def media_storage(tmp_path_factory):
    # Use ONE MEDIA_ROOT for the whole test session so files written in
    # class-scoped setUpTestData are readable from the test methods. A
    # per-test (function-scoped) MEDIA_ROOT broke this: setUpTestData runs
    # under the base default MEDIA_ROOT while each method saw its own tmpdir,
    # so upload.file.path resolved to a file that was never written there
    # (FileNotFoundError). This mirrors `manage.py test`, which runs all tests
    # under a single MEDIA_ROOT and is green, while keeping files out of the
    # repo. DASS-3577.
    from django.conf import settings

    settings.MEDIA_ROOT = str(tmp_path_factory.mktemp("media"))
    yield


@pytest.fixture(autouse=True)
def _reset_global_state():
    # Reset process-global state that Django's per-test transaction rollback does
    # not undo, so tests cannot leak HTTP mocks or cache entries into one another
    # (DASS-3577). Reset in teardown only (after yield), so a test's own
    # setUp/setUpTestData registrations are never cleared mid-test.
    yield
    responses.reset()
    cache.clear()


@pytest.fixture
def user() -> User:
    return UserFactory()

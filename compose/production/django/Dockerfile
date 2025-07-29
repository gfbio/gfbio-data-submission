ARG PYTHON_VERSION=3.10-slim-bullseye

# define an alias for the specfic python version used in this file.
FROM python:${PYTHON_VERSION} as python

# Python build stage
FROM python as python-build-stage

ARG BUILD_ENVIRONMENT=production

# Install apt packages
RUN apt-get update && apt-get install --no-install-recommends -y \
  # dependencies for building Python packages
  build-essential \
  # psycopg2 dependencies
  libpq-dev

# Requirements are installed here to ensure they will be cached.
COPY ./requirements .

# Create Python Dependency and Sub-Dependency Wheels.
RUN pip wheel --wheel-dir /usr/src/app/wheels  \
  -r ${BUILD_ENVIRONMENT}.txt

# Python 'run' stage
FROM python as python-run-stage

ARG BUILD_ENVIRONMENT=production
ARG APP_HOME=/app

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV BUILD_ENV ${BUILD_ENVIRONMENT}

WORKDIR ${APP_HOME}

# java need this to be created
RUN mkdir -p /usr/share/man/man1

RUN addgroup --system django \
  && adduser --system --ingroup django django

# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # psycopg2 dependencies
  libpq-dev \
  # Translations dependencies
  gettext \
  #
  dnsutils \
  # needed for java
  ca-certificates \
  # java itself
  openjdk-17-jdk \
  # install libfuse \
  libfuse2 \
  # install s3fs to mount s3 buckets
  s3fs \
  # install gosu to run the entrypoint as non-root
  gosu \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# All absolute dir copies ignore workdir instruction. All relative dir copies are wrt to the workdir instruction
# copy python dependency wheels from python-build-stage
COPY --from=python-build-stage /usr/src/app/wheels  /wheels/

# use wheels to install python dependencies
RUN pip install --no-cache-dir --no-index --find-links=/wheels/ /wheels/* \
  && rm -rf /wheels/ \

# Java
ENV JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
ENV PATH="$JAVA_HOME/bin:$PATH"

RUN pip install abcd-converter==0.0.4 --index-url https://gitlab-pe.gwdg.de/api/v4/projects/26166/packages/pypi/simple

COPY ./ena_webin_cli /ena_webin_cli

# Install Aspera CLI (ascp) -----------------------------------------------------------------
# Create a non-root user
# TODO/FIXME: use django user that is created in line 40 instead of asperauser ?
RUN useradd -m asperauser
USER asperauser
RUN whoami
RUN tar -xzvf /ena_webin_cli/ibm-aspera-connect_4.2.13.820_linux_x86_64.tar.gz -C /tmp && \
    /bin/bash /tmp/ibm-aspera-connect_4.2.13.820_linux_x86_64.sh && \
    rm -f /tmp/ibm-aspera-connect_4.2.13.820_linux_x86_64.sh

# commands in /home/asperauser/.aspera/connect/bin
# -------------------------------------------------------------------------------------------------

USER root
COPY --chown=django:django ./compose/production/django/entrypoint /entrypoint
USER root
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint


COPY --chown=django:django ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY --chown=django:django ./compose/production/django/ci_start /ci_start
RUN sed -i 's/\r$//g' /ci_start
RUN chmod +x /ci_start

COPY --chown=django:django ./compose/production/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY --chown=django:django ./compose/production/django/celery/worker/start-transfer-worker /start-celery-transfer-worker
RUN sed -i 's/\r$//g' /start-celery-transfer-worker
RUN chmod +x /start-celery-transfer-worker

COPY --chown=django:django ./compose/production/django/celery/worker/backup-start /start-celeryworkerbackup
RUN sed -i 's/\r$//g' /start-celeryworkerbackup
RUN chmod +x /start-celeryworkerbackup

COPY --chown=django:django ./compose/production/django/celery/beat/start /start-celerybeat
RUN sed -i 's/\r$//g' /start-celerybeat
RUN chmod +x /start-celerybeat


COPY ./compose/production/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

# passwd-s3fs contains credentials for s3fs: <ACCESS_KEY>:<SECRET_KEY>
COPY ./compose/production/django/passwd-s3fs /etc/passwd-s3fs
RUN chown django:django /etc/passwd-s3fs
RUN chmod 600 /etc/passwd-s3fs

# copy application code to WORKDIR
COPY --chown=django:django . ${APP_HOME}

# make django owner of the WORKDIR directory as well.
RUN chown django:django ${APP_HOME}

# do not switch to user django here, as it was done before, and stay user root
# to execute permission changes in the entrypoint
# USER django

ENTRYPOINT ["/entrypoint"]

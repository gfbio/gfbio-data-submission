ARG PYTHON_VERSION=3.10-slim-bullseye

# define an alias for the specfic python version used in this file.
FROM python:${PYTHON_VERSION} as python

# Python build stage
FROM python as python-build-stage

ARG BUILD_ENVIRONMENT=local

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

ARG BUILD_ENVIRONMENT=local
ARG APP_HOME=/app

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV BUILD_ENV ${BUILD_ENVIRONMENT}

WORKDIR ${APP_HOME}

# java need this to be created
RUN mkdir -p /usr/share/man/man1


# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # psycopg2 dependencies
  libpq-dev \
  # Translations dependencies
  gettext \
  # needed for java
  ca-certificates \
  # java itself
  openjdk-17-jdk \
  # install s3fs to mount s3 buckets
  s3fs \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# All absolute dir copies ignore workdir instruction. All relative dir copies are wrt to the workdir instruction
# copy python dependency wheels from python-build-stage
COPY --from=python-build-stage /usr/src/app/wheels  /wheels/

# use wheels to install python dependencies
RUN pip install --no-cache-dir --no-index --find-links=/wheels/ /wheels/* \
  && rm -rf /wheels/

# Java
ENV JAVA_HOME="/usr/lib/jvm/java-17-openjdk-amd64"
ENV PATH="$JAVA_HOME/bin:$PATH"

# Requirements are installed here to ensure they will be cached.
COPY ./requirements /requirements
RUN pip install -r /requirements/local.txt




# TODO: when testing as 3rd party library. copy local build of django_upload_tools package to docker
#
# COPY --chown=django:django ./django-upload-tools-1.0.tar.gz ./django-upload-tools-1.0.tar.gz
# RUN pip install ./django-upload-tools-1.0.tar.gz

COPY --chown=django:django abcd_converter-0.0.4.tar.gz ./abcd_converter-0.0.4.tar.gz
RUN pip install ./abcd_converter-0.0.4.tar.gz

# RUN pip install abcd-converter --index-url https://gitlab-pe.gwdg.de/api/v4/projects/26166/packages/pypi/simple

COPY ./ena_webin_cli /ena_webin_cli

# Install Aspera CLI (ascp) -----------------------------------------------------------------
# Create a non-root user
RUN useradd -m asperauser
#
USER asperauser
RUN whoami
RUN tar -xzvf /ena_webin_cli/ibm-aspera-connect_4.2.13.820_linux_x86_64.tar.gz -C /tmp && \
    /bin/bash /tmp/ibm-aspera-connect_4.2.13.820_linux_x86_64.sh && \
    rm -f /tmp/ibm-aspera-connect_4.2.13.820_linux_x86_64.sh \

# commands in /home/asperauser/.aspera/connect/bin

# -------------------------------------------------------------------------------------------------

USER root
COPY ./compose/production/django/entrypoint /entrypoint
USER root
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./compose/local/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY ./compose/local/django/start_debug /start_debug
RUN sed -i 's/\r$//g' /start_debug
RUN chmod +x /start_debug

COPY ./compose/local/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY ./compose/local/django/celery/beat/start /start-celerybeat
RUN sed -i 's/\r$//g' /start-celerybeat
RUN chmod +x /start-celerybeat

COPY ./compose/local/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

COPY ./compose/local/django/passwd-s3fs /etc/passwd-s3fs
RUN chmod 600 /etc/passwd-s3fs




# copy application code to WORKDIR
COPY . ${APP_HOME}

ENTRYPOINT ["/entrypoint"]

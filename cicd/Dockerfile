FROM python:3.10-slim-bullseye

ENV PYTHONUNBUFFERED 1

RUN apt-get update \
  # dependencies for building Python packages
  && apt-get install -y build-essential \
  # psycopg2 dependencies
  && apt-get install -y libpq-dev \
  # Translations dependencies
  && apt-get install -y gettext \
  # dig tool to get ip of allowed domains
  && apt-get install -y dnsutils \
  # needed for java
  && apt-get ca-certificates \
  # java itself
  && apt-get openjdk-17-jdk \
  # install s3fs to mount s3 buckets
  && apt-get s3fs \
  # install gosu to run the entrypoint as non-root
  && apt-get gosu \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*


#RUN apk update \
#  # psycopg2 dependencies
#  && apk add --virtual build-deps gcc python3-dev musl-dev \
#  && apk add postgresql-dev \
#  # Pillow dependencies
#  && apk add jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev \
#  # CFFI dependencies
#  && apk add libffi-dev py-cffi \
#  # borkerage git dependencies
#  && apk add git \
#  # dig tool to get ip of allowed domains
#  && apk add bind-tools

ARG USER_ID=998
ARG GROUP_ID=997

RUN addgroup --system --gid $GROUP_ID django \
    && adduser --system --uid $USER_ID --ingroup django django

# Requirements are installed here to ensure they will be cached.
COPY ./requirements /requirements
RUN pip install --no-cache-dir -r /requirements/production.txt \
    && rm -rf /requirements

RUN pip install --no-cache-dir abcd-converter==0.0.4 --index-url https://gitlab-pe.gwdg.de/api/v4/projects/26166/packages/pypi/simple

# Install Aspera CLI (ascp) -----------------------------------------------------------------
# Create a non-root user
# TODO/FIXME: use django user that is created in line 40 instead of asperauser ?
RUN useradd -m asperauser
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
RUN chown django /entrypoint

COPY ./compose/production/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start
RUN chown django /start
COPY ./compose/production/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker
RUN chown django /start-celeryworker

COPY --chown=django:django ./compose/production/django/celery/worker/start-transfer-worker /start-celery-transfer-worker
RUN sed -i 's/\r$//g' /start-celery-transfer-worker
RUN chmod +x /start-celery-transfer-worker

COPY ./compose/production/django/celery/beat/start /start-celerybeat
RUN sed -i 's/\r$//g' /start-celerybeat
RUN chmod +x /start-celerybeat
RUN chown django /start-celerybeat

COPY ./compose/production/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

# passwd-s3fs contains credentials for s3fs: <ACCESS_KEY>:<SECRET_KEY>
COPY ./compose/production/django/passwd-s3fs /etc/passwd-s3fs
RUN chown django:django /etc/passwd-s3fs
RUN chmod 600 /etc/passwd-s3fs

COPY --chown=django:django . /app

# do not switch to user django here, as it was done before, and stay user root
# to execute permission changes in the entrypoint
# USER django

WORKDIR /app

ENTRYPOINT ["/entrypoint"]

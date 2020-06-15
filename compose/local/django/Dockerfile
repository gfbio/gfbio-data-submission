# TODO: was 3.8 but there were some incompabilities with 3rd party libraries
FROM python:3.7-slim-buster

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1

# java need this to be created
RUN mkdir -p /usr/share/man/man1

RUN apt-get update \
  #
  # dependencies for building Python packages
  && apt-get install -y build-essential \
  # psycopg2 dependencies
  && apt-get install -y libpq-dev \
  # Translations dependencies
  && apt-get install -y gettext \
  # java-runtime-environment that works with slim-buster
  # TODO: this will not work well for ena web cli, but will install the package without trouble
  # && apt-get install -y openjdk-11-jre \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# Java
COPY ./compose/local/django/install_java8_jre.sh /
RUN chmod +x /install_java8_jre.sh
RUN /install_java8_jre.sh

ENV JAVA_HOME=/opt/java/openjdk \
      PATH="/opt/java/openjdk/bin:$PATH"

# Requirements are installed here to ensure they will be cached.
COPY ./requirements /requirements
RUN pip install -r /requirements/local.txt

COPY ./compose/production/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./compose/local/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY ./compose/local/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY ./compose/local/django/celery/beat/start /start-celerybeat
RUN sed -i 's/\r$//g' /start-celerybeat
RUN chmod +x /start-celerybeat

COPY ./compose/local/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

COPY ./ena_webin_cli /ena_webin_cli

WORKDIR /app

ENTRYPOINT ["/entrypoint"]

#!/usr/bin/env bash

set -o errexit
set -o pipefail

# todo: turn on after #1295
# set -o nounset


cmd="$@"

# This entrypoint is used to play nicely with the current cookiecutter configuration.
# Since docker-compose relies heavily on environment variables itself for configuration, we'd have to define multiple
# environment variables just to support cookiecutter out of the box. That makes no sense, so this little entrypoint
# does all this for us.
export REDIS_URL=redis://redis:6379

# TODO: 23.11.2018: from gds src. I comment this for comparision. Redis should be sufficient as broker.
# export RABBIT_URL=amqp://$RABBITMQ_DEFAULT_USER:$RABBITMQ_DEFAULT_PASS@rabbit:5672//

# the official postgres image uses 'postgres' as default user if not set explictly.
if [ -z "$POSTGRES_USER" ]; then
    export POSTGRES_USER=postgres
fi

export DATABASE_URL=postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@postgres:5432/$POSTGRES_USER

export CELERY_BROKER_URL=$REDIS_URL/0
# TODO: 23.11.2018: from gds src. I comment this for comparision. Redis should be sufficient as broker.
# export CELERY_BROKER_URL=$RABBIT_URL


function postgres_ready(){
python << END
import sys
import psycopg2
try:
    conn = psycopg2.connect(dbname="$POSTGRES_USER", user="$POSTGRES_USER", password="$POSTGRES_PASSWORD", host="postgres")
except psycopg2.OperationalError:
    sys.exit(-1)
sys.exit(0)
END
}

until postgres_ready; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - continuing..."
exec $cmd

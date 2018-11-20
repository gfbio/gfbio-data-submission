# SOP Run Tests Manually


## Aim and Scope
 This SOP describes how to run all unit tests of the broker agent software, inside the dedicated Docker containers,  manually from the command line.
 
## Procedure

1. Enter source code directory

    cd ${SRC_DIR}

1. Build containers and collect static objects

    docker-compose -f dev.yml build
    docker-compose -f dev.yml run django python manage.py collectstatic

1. Execute all tests for the brokerage app

    docker-compose -f dev.yml run django python manage.py test genomicsdataservices.brokerage

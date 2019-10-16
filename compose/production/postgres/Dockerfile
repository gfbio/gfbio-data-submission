FROM postgres:11.3

COPY ./compose/production/postgres/maintenance /usr/local/bin/maintenance
RUN chmod -v +x /usr/local/bin/maintenance/*
RUN mv -v /usr/local/bin/maintenance/* /usr/local/bin \
    && rmdir -v /usr/local/bin/maintenance

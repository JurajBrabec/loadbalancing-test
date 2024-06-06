FROM node:20

RUN apt-get update; \
    apt-get install -y \
    git \
    nano \
    ; \
    apt-get clean

ADD . /.init
RUN chown -R root:root /.init
RUN chmod -R 755 /.init

RUN mkdir -p /.npm
RUN chown -R 1000740000:root /.npm
RUN chmod -R 775 /.npm

WORKDIR /opt/code-base
RUN chown -R 1000740000:root .
RUN chmod -R 775 .

CMD sh /.init/entrypoint.sh

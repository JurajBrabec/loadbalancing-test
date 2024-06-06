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

WORKDIR /opt/code-base

CMD sh /.init/entrypoint.sh

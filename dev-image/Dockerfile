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

RUN mkdir -p /.vscode
RUN chown -R 1000740000:root /.vscode
RUN chmod -R 775 /.vscode

WORKDIR /opt/code-base
RUN chown -R 1000740000:root .
RUN chmod -R 775 .

CMD sh /.init/entrypoint.sh

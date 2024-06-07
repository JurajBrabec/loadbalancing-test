FROM node:20

USER root
RUN apt-get update; \
    apt-get install -y \
    git \
    nano \
    ; \
    apt-get clean

ADD . /.init
RUN chown -R root:root /.init
RUN chmod -R 755 /.init

RUN touch /.gitconfig
RUN chown -R 1000730000:root /.gitconfig
RUN chmod -R 775 /.gitconfig

RUN mkdir -p /.vscode-server
RUN chown -R 1000730000:root /.vscode-server
RUN chmod -R 775 /.vscode-server

VOLUME /opt/code-base

CMD sh /.init/entrypoint.sh

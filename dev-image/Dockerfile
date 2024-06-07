FROM node:20

USER root
RUN apt-get update; \
    apt-get install -y \
    git \
    nano \
    ; \
    apt-get clean

ADD . /.init
RUN chown -R root:root /.init; chmod -R 755 /.init
RUN touch /.gitconfig; chown -R 1000730000:root /.gitconfig; chmod -R 775 /.gitconfig
RUN mkdir -p /.vscode-server; chown -R 1000730000:root /.vscode-server; chmod -R 775 /.vscode-server
RUN useradd -D -s /bin/bash
RUN useradd -m -d / -s /bin/bash -u 1000730000 -g root openshift
RUN sed -i "s#/sbin/nologin#/bin/bash#g" /etc/passwd
RUN chmod 775 /etc/passwd

VOLUME /opt/code-base

USER openshift
WORKDIR /opt/code-base

CMD sh /.init/entrypoint.sh

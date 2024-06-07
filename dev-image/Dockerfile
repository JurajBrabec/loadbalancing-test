FROM node:20

USER root
RUN apt-get update; \
    apt-get install -y \
    curl \
    git \
    jq \
    nano \
    ; \
    apt-get clean

ADD . /.init
RUN chown -R root:root /.init; chmod -R 755 /.init
RUN chmod 775 /etc/passwd
# RUN sed -i "s#/sbin/nologin#/bin/bash#g" /etc/passwd
RUN useradd -D -s /usr/bin/bash
RUN groupadd -g 1000730000 openshift; useradd -m -d /opt/code-base -s /usr/bin/bash -u 1000730000 -g root openshift
# RUN mkdir -p /home/openshift; chown -R openshift:root /home-openshift; chmod -R 775 /home/openshift
# RUN touch /.gitconfig; chown -R 1000730000:root /.gitconfig; chmod -R 775 /.gitconfig
# RUN mkdir -p /.vscode-server; chown -R 1000730000:root /.vscode-server; chmod -R 775 /.vscode-server

VOLUME /opt/code-base

USER openshift
WORKDIR /opt/code-base

CMD sh /.init/entrypoint.sh

FROM node:20

ARG PERSISTENT_VOLUME=/opt/code-base
ARG OPENSHIFT_HOME=/home/openshift
ARG OPENSHIFT_UID=1000710000
ARG GITHUB_PAT=ghp_*

ENV GITHUB_PAT=${GITHUB_PAT}

USER root
RUN apt-get update; \
    apt-get install -y \
    curl \
    gh \
    git \
    jq \
    nano \
    ; \
    apt-get clean

ADD . /.init/
RUN chown -R root:root /.init; chmod -R 755 /.init
#RUN chmod g+w /etc/passwd
#RUN useradd -D -s /usr/bin/bash

RUN groupadd -g ${OPENSHIFT_UID} openshift; useradd -m -d ${OPENSHIFT_HOME} -s /usr/bin/bash -u ${OPENSHIFT_UID} -g root openshift
RUN chown -R openshift:root ${OPENSHIFT_HOME}; chmod -R g+w ${OPENSHIFT_HOME}

VOLUME ${PERSISTENT_VOLUME}

USER openshift
WORKDIR ${OPENSHIFT_HOME}

CMD bash /.init/entrypoint.sh

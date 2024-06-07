FROM node:20
ARG OPENSHIFT_HOME=/opt/code-base
ARG OPENSHIFT_UID=1000730000

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
RUN useradd -D -s /usr/bin/bash
RUN groupadd -g ${OPENSHIFT_UID} openshift; useradd -m -d ${OPENSHIFT_HOME} -s /usr/bin/bash -u ${OPENSHIFT_UID} -g root openshift

VOLUME ${OPENSHIFT_HOME}

USER openshift
WORKDIR ${OPENSHIFT_HOME}

CMD sh /.init/entrypoint.sh

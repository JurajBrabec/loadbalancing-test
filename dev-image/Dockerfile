FROM node:20

RUN echo "root ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

USER root

ADD . /.init
RUN chown -R root:root /.init
RUN chmod -R 755 /.init


# Install dependencies
RUN apt update && apt install -y \
    sudo \
    openssh-server \
    mc \
    git \
    ; \
    sed -i s/#PermitRootLogin.*/PermitRootLogin\ yes/ /etc/ssh/sshd_config; \
    ssh-keygen -A

EXPOSE 22
CMD sh /.init/entrypoint.sh; sh /.init/daemon.sh
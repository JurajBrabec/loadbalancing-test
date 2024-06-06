FROM node:20

WORKDIR /opt
ADD . /.init
RUN chown -R root:root /.init
RUN chmod -R 755 /.init

# Install dependencies
RUN apt-get update; \
    apt-get install -y \
    git \
    ; \
    apt-get clean

CMD sh /.init/entrypoint.sh;
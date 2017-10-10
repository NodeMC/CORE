FROM node:alpine

WORKDIR /CORE
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD [ "/usr/bin/docker-entrypoint" ]

# Fix SSL. See https://github.com/Yelp/dumb-init/issues/73
RUN   apk update \
 &&   apk --no-cache add ca-certificates wget libc6-compat make automake autoconf python g++ \
 &&   update-ca-certificates

# Install dumb-init
RUN wget -O /usr/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64
RUN chmod +x /usr/bin/dumb-init

# Update base
RUN apk upgrade --no-cache --no-self-upgrade --available

# Add our entrypoint.
COPY ./docker-entrypoint.sh /usr/bin/docker-entrypoint
RUN chmod +x /usr/bin/docker-entrypoint

# Run dos2unix on the entrypoint, which fixes shell scripts.
# NOTE: This may break in the future if we use more shell scripts.
#       For some reason it can't process dos2unix *, and errors with:
#
#       dos2unix: No such file or directory '*'
#
#       Wrapping it in sh -c "dos2unix *" doesn't fix this, so it's most
#       likely the binary that's not supporting wildcards... installing a
#       non-busybox version of dos2unix may fix this in the future.
RUN dos2unix -u /usr/bin/docker-entrypoint

# Cleanup.
# RUN apk purge --no-cache make automake autoconf python g++

# Copy Our Code
COPY . /CORE

# Install node modules.
RUN yarn && mv node_modules /

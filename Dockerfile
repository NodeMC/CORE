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

# Cleanup.
# RUN apk purge --no-cache make automake autoconf python g++

# Copy Our Code
COPY . /CORE

# Install node modules.
RUN yarn && mv node_modules /

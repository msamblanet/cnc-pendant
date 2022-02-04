#
# This is a baseline Dockerfile from @msamblanet/node-project-template
# It is copied only when the project is first initialized.  It should
# be modified to suit your project's needs OR deleted if you do not
# need it.
#
FROM node:16-alpine

#
# If you need to use a specific UID/GID, uncomment the following block
#
# ARG UID=1200
# ARG GID=1200
# RUN usermod --uid ${UID} node && groupmod --gid ${GID} node

#
# Default value of production for the environment
#
ENV NODE_ENV=production

#
# Assume we will expose 8080, 9000, and 9500
# (for app, lightship, and prometheus respectively)
#
EXPOSE 8080
EXPOSE 9000
EXPOSE 9500

#
# Make a work folder owned by root:node
#

RUN mkdir --mode 770 /app && chown root:node /app
WORKDIR /app

#
# Establish the config/configmap folder for kube to drop config maps into
# Then symlink the local.yaml back down to config/ for use by node-config
#
RUN mkdir ./config && \
    mkdir ./config/configmap && \
    echo 'This folder is a placeholder to be overlaid by a Kubernetes configmap volume' > ./config/configmap/README.txt \
    echo '# Placeholder local.yaml to be overlaid by configmap' > ./config/configmap/local.yaml &&  \
    ln -s ./config/configmap/local.yaml ./config/local.yaml

#
# Copy package.json and install
# Fix up all the file permissions when done
#
COPY --chown=root:node package*.json ./
RUN npm run prod:init && \
    chmod -R g-w,o-rwx /app

#
# Copy all our source over and lock down file permissions
#
COPY --chown=root:node dist ./dist
COPY --chown=root:node config ./config
COPY --chown=root:node graphql ./graphql
RUN chmod -R g-w,o-rwx ./dist ./config ./graphql

#
# DO NOT RUN via npm - npm breaks the signal chain and it does not shutdown properly
#
USER node
CMD ["node", "dist/main.js"]

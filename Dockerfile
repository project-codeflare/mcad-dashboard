# Build arguments
ARG SOURCE_CODE=.

# Use ubi8/nodejs-18 as default base image
ARG BASE_IMAGE="registry.access.redhat.com/ubi8/nodejs-18:latest"

FROM ${BASE_IMAGE} as builder

## Build args to be used at this step
ARG SOURCE_CODE

WORKDIR /usr/src/app

## Copying in source code
COPY --chown=default:root ${SOURCE_CODE} /usr/src/app

# Change file ownership to the assemble user
USER default

RUN npm cache clean --force

RUN npm ci --omit=optional

RUN npm run build

FROM ${BASE_IMAGE} as runtime

WORKDIR /usr/src/app

RUN mkdir /usr/src/app/logs && chmod 775 /usr/src/app/logs

USER default

COPY --chown=default:root --from=builder /usr/src/app/frontend/public /usr/src/app/frontend/public
COPY --chown=default:root --from=builder /usr/src/app/backend/package.json /usr/src/app/backend/package.json
COPY --chown=default:root --from=builder /usr/src/app/backend/package-lock.json /usr/src/app/backend/package-lock.json
COPY --chown=default:root --from=builder /usr/src/app/backend/dist /usr/src/app/backend/dist
COPY --chown=default:root --from=builder /usr/src/app/.npmrc /usr/src/app/backend/.npmrc
COPY --chown=default:root --from=builder /usr/src/app/.env /usr/src/app/.env
COPY --chown=default:root --from=builder /usr/src/app/data /usr/src/app/data

RUN cd backend && npm cache clean --force && npm ci --omit=dev --omit=optional && chmod -R g+w ${HOME}/.npm

WORKDIR /usr/src/app/backend

# TEMPORARY add sh scripts 
RUN wget "http://stedolan.github.io/jq/download/linux64/jq"
RUN chmod 777 ./jq
COPY --chown=default:root /backend/src/routes/api/appwrappers/appwrapper_puller.sh ./src/routes/api/appwrappers/appwrapper_puller.sh
COPY --chown=default:root /backend/src/routes/api/mcad-prometheus/get-route.sh ./src/routes/api/mcad-prometheus/get-route.sh
COPY --chown=default:root /backend/src/routes/api/metrics-data/get-route.sh ./src/routes/api/metrics-data/get-route.sh

CMD ["npm", "run", "start"]

LABEL io.opendatahub.component="mcad-dashboard" \
      io.k8s.display-name="mcad-dashboard" \
      name="project-codeflare/mcad-dashboard-ubi8" \
      summary="mcad-dashboard" \
      description="MCAD Dashboard"

FROM node:22-alpine

RUN apk update && apk upgrade --no-cache && \
    addgroup -g 10001 -S appgroup && adduser -S -D -H -u 10001 -G appgroup appuser

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --omit=dev && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
           /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack

COPY --chown=appuser:appgroup src ./src

USER appuser

CMD ["node", "src/index.js"]
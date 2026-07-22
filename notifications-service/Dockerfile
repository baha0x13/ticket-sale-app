FROM node:22-alpine

RUN addgroup -g 10001 -S appgroup && adduser -S -D -H -u 10001 -G appgroup appuser

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --omit=dev

COPY --chown=appuser:appgroup src ./src

USER appuser

CMD ["node", "src/index.js"]
FROM node:22-alpine

RUN addgroup -g 10001 -S appgroup && adduser -S -D -H -u 10001 -G appgroup appuser

WORKDIR /app

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --omit=dev

COPY --chown=appuser:appgroup src ./src

USER appuser

EXPOSE 3030

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -qO- http://localhost:3030/healthz || exit 1

CMD ["node", "src/index.js"]

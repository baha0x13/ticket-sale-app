FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM nginx:1.27-alpine

RUN addgroup -g 10001 -S appgroup && adduser -S -D -H -u 10001 -G appgroup appuser && \
    chown -R appuser:appgroup /var/cache/nginx /run && \
    touch /run/nginx.pid && chown appuser:appgroup /run/nginx.pid

COPY --from=build --chown=appuser:appgroup /app/dist /usr/share/nginx/html

COPY --chown=appuser:appgroup nginx.conf /etc/nginx/conf.d/default.conf

COPY --chmod=755 docker-entrypoint.d/40-generate-frontend-config.sh /docker-entrypoint.d/40-generate-frontend-config.sh

USER appuser

EXPOSE 8083

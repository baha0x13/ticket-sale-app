#!/bin/sh
set -eu

envsubst '${API_GATEWAY_URL} ${API_GATEWAY_PORT}' \
  < /usr/share/nginx/html/config.template.js \
  > /usr/share/nginx/html/config.js

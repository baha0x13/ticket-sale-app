// Local-dev fallback only. Inside a container, the entrypoint script
// (docker-entrypoint.d/40-generate-frontend-config.sh) overwrites this file at
// startup, generated from config.template.js + real env vars.
window.APP_CONFIG = {
  API_URL: "http://localhost:3030"
};

# Ticket-Sale

An event-ticket-sale platform (originally a cinema booking app) built as a
microservices architecture — five services (`auth-service`, `api-service`,
`movie-service`, `notifications-service`, `frontend`) behind RabbitMQ and
Postgres (Supabase-hosted). This repo started from an existing open-source
cinema-booking app; everything described below — CI, CD, the Postgres
migration, and the observability stack — was built on top of it.

## CI/CD status

- **CI** ([`.github/workflows/ci-pipeline.yaml`](.github/workflows/ci-pipeline.yaml)):
  lint + `npm audit` per service, Gitleaks secret scan, Semgrep SAST, image
  build, Trivy image scan (CRITICAL/HIGH gate), `docker compose` integration
  test, push to `ghcr.io/baha0x13/ticket-sale-<service>`, then auto-bump the
  image tags in the `ticket-sale-config` GitOps repo's staging overlay. All
  green.
- **CD**: fully wired up via [ArgoCD](https://argo-cd.readthedocs.io/) watching
  a separate [`ticket-sale-config`](https://github.com/baha0x13/ticket-sale-config)
  repo (Kustomize base + `overlays/staging` + `overlays/prod`), running on two
  independent Kubernetes clusters (Minikube). Staging deploys automatically on
  every push; production only updates through a manually-gated
  [`promote-to-prod.yaml`](.github/workflows/promote-to-prod.yaml)
  `workflow_dispatch`, behind a GitHub Environment approval.
- **Observability**: `kube-prometheus-stack` (Prometheus Operator + Grafana)
  running in both environments, scraping custom metrics from all four backend
  services (`prom-client`), RabbitMQ's built-in Prometheus plugin, and
  `postgres-exporter` for the Supabase database. Dashboards cover app request
  rates/latency, queue throughput, and database health.

## How to run locally

__Before you start__

* Install Docker and Docker Compose
* Copy `.env` and set `SMTP_USER`/`SMTP_PASS` (a Gmail app password, or any
  SMTP account works — used by `notifications-service` to send ticket emails).
  RabbitMQ and Postgres are both bundled in `compose.yaml`, no external
  service needed for those.

```
# start services (builds images locally, matching the CI build args)
docker compose up -d --build

# seed an admin account
docker compose exec -T auth-service node src/init

# seed sample movies
docker compose exec -T movie-service node src/init
```

After starting services the web app is available on `http://localhost:8083`, and the
API directly on `http://localhost:3030`.

## Features

- **Browsing available movies**, with details/trailers fetched from
  [OMDb](http://www.omdbapi.com/) and [TMDb](https://www.themoviedb.org/)
- **Buying tickets**, with orders persisted to Postgres
- **Temporary seat reservations** in real time via
  [Socket.io](https://socket.io/) (one room per movie — a client only
  receives events for the movie it's currently browsing)
- **Ticket delivery by email** on purchase, via `notifications-service`
- **Admin dashboard**: full movie management (add, edit, soft-delete,
  restore from an archive view), pending-payment approval/rejection, and
  user role management

# Development

## Commands

```
# rebuild containers
docker compose build

# list all containers
docker compose ps -a

# run the same smoke test CI runs
./scripts/smoke-test.sh
```

## Useful links

- how to apply environment variables on container build stage https://github.com/docker/compose/issues/1837#issuecomment-316896858
- docker-compose build args (map vs list) https://github.com/docker/for-mac/issues/2661#issuecomment-370362897

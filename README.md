# TicketFlow

An event-ticket-sale platform (originally a cinema booking app) built as a
microservices architecture — five services (`auth-service`, `api-service`,
`movie-service`, `notifications-service`, `frontend`) behind RabbitMQ and MySQL. See
[`ARCHITECTURE.md`](ARCHITECTURE.md) for how requests actually flow through the
system, and [`architecture.md`](architecture.md) for the DevOps/Kubernetes design.

## CI/CD status

- **CI** ([`.github/workflows/ci-pipeline.yaml`](.github/workflows/ci-pipeline.yaml)):
  lint + `npm audit` per service, Gitleaks secret scan, Semgrep SAST, image build,
  Trivy image scan (CRITICAL/HIGH gate), `docker compose` integration test, then push
  to `ghcr.io/baha0x13/ticket-sale-<service>` on `master`. All green.
- **CD**: not yet wired up. Next step is ArgoCD + a local Minikube cluster, watching a
  separate `ticket-sale-config` GitOps repo — see [`CD_PLAN.md`](CD_PLAN.md).

## Architecture

![](docs/architecture.jpeg)


## How to run locally

__Before you start__

* Install Docker and Docker Compose
* Copy `.env` and set `AMQP_URL` (a free 'Little Lemur' plan from
  [CloudAMQP](https://www.cloudamqp.com/) works, or point at the `rabbitmq` service
  already defined in `compose.yaml`)

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

- **Browsing available movies at cinema**
   
   *Details of movies are fetched from external api's [OMDb](http://www.omdbapi.com/) [TMDb](https://www.themoviedb.org/)*
   
   ![](docs/movies.jpg)
   
   ![](docs/movie.jpg)
   
- **Buying tickets**
    
   *Orders are stored in local database*
   
   ![](docs/demo.gif)
   
   ![](docs/orders.png)
    

- **Temporary reservations** 

    *Reservations are implemented by using [Socket.io](https://socket.io/) 
    (each movie has own room -> each client subscribe only room/movie event which is actually browsed) 
    and stored in-memory on api-gateway.*
    *To improve api scalability on production, reservations should be stored in distributed DB like [Redis](https://redis.io/)*
    
    ![](docs/temporary-reservation.gif)
    
- **Sending email with purchased ticket** 

    *Using fake SMTP service [Ethereal](https://ethereal.email/)*

    ![](docs/ticket.png)

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

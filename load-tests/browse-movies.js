import http from 'k6/http';
import { check, sleep } from 'k6';

// Point this at staging by default -- never run load tests against prod.
const BASE_URL = __ENV.BASE_URL || 'http://api.ticket-sale.staging.local';

// Deliberately conservative for a first run on a local Minikube setup sharing
// the host with the cluster itself. Bump the target numbers once you've seen
// where this run actually lands.
export const options = {
    stages: [
        { duration: '30s', target: 10 },  // warm up
        { duration: '1m', target: 50 },   // ramp to 50 concurrent users
        { duration: '1m', target: 50 },   // hold at 50
        { duration: '30s', target: 0 },   // ramp down
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<1000'],
    },
};

export default function () {
    // Browse the movie list -- movie-service's real read path (AMQP -> Postgres,
    // enriched per-movie with an OMDb lookup server-side).
    const listRes = http.get(`${BASE_URL}/movies`);
    check(listRes, {
        'movies list status is 200': (r) => r.status === 200,
    });

    sleep(1); // think-time: a real user reads the list before clicking in

    let movies = [];
    try {
        movies = JSON.parse(listRes.body);
    } catch {
        movies = [];
    }

    if (movies.length > 0) {
        const movie = movies[Math.floor(Math.random() * movies.length)];
        const detailRes = http.get(`${BASE_URL}/movies/${movie.id}`);
        check(detailRes, {
            'movie detail status is 200': (r) => r.status === 200,
        });
    }

    sleep(1);
}

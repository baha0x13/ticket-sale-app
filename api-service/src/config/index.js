

module.exports = {
    amqp_url: process.env.AMQP_URL || 'amqp://guest:guest@rabbitmq',

    services: {
        movies_q: process.env.MOVIES_QUEUE || 'movies'
    },

    jwt_secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    auth_service_url: process.env.AUTH_SERVICE_URL || 'http://auth-service:4000',
    frontend_origin: process.env.FRONTEND_ORIGIN || 'http://localhost:8083'

};
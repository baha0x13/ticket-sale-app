

module.exports = {
    amqp_url: process.env.AMQP_URL || 'amqp://guest:guest@rabbitmq',

    q: process.env.NOTIFICATIONS_QUEUE || 'notifications'

};
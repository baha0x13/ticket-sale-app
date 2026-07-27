

module.exports = {
    amqp_url: process.env.AMQP_URL || 'amqp://guest:guest@rabbitmq',

    q: process.env.NOTIFICATIONS_QUEUE || 'notifications',

    smtp: {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }

};
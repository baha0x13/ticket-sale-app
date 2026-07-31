const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const emailsSent = new client.Counter({
    name: 'emails_sent_total',
    help: 'Total number of emails attempted',
    labelNames: ['status'],
    registers: [register]
});

module.exports = { register, emailsSent };

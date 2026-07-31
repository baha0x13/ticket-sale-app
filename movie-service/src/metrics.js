const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const messagesProcessed = new client.Counter({
    name: 'amqp_messages_processed_total',
    help: 'Total number of AMQP messages processed',
    labelNames: ['action', 'status'],
    registers: [register]
});

module.exports = { register, messagesProcessed };

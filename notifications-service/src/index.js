const amqp = require('amqplib');
const http = require('http');
const config = require('./config');
const notificationController = require('./controllers/notification');
const { register, emailsSent } = require('./metrics');


console.log('> notification service starting...');

let amqpConnected = false;

/**
 *
 * @param {string} q
 * @returns {Promise<amqp.channel | Error>}
 */
async function createChannel(q) {
    const connection = await amqp.connect(config.amqp_url);

    connection.on('error', (err) => {
        console.error('AMQP connection error', err);
        amqpConnected = false;
        process.exit(1);
    });
    connection.on('close', () => {
        console.error('AMQP connection closed');
        amqpConnected = false;
        process.exit(1);
    });

    const channel = await connection.createChannel();
    await channel.assertQueue(q);
    amqpConnected = true;
    return channel;
}


/**
 *
 * @param {amqp.channel} channel
 * @param {object} msg
 * @param {Buffer} msg.content
 * @returns {Promise<void|Error>}
 */
async function consume(channel, msg) {
    if(msg === null) return;
    try {
        const mail = JSON.parse(msg.content.toString());
        console.log(`> Sending email to ${mail.to} ...`);
        await notificationController.send(mail);
        console.log(`> Email has been successfully send to ${mail.to}`);
        channel.ack(msg);
        emailsSent.inc({ status: 'success' });
    }catch (e) {
        console.log(e);
        emailsSent.inc({ status: 'error' });
    }
}



createChannel(config.q).then(channel => {
    console.log('> notification service listening for messages');
    channel.consume(config.q, msg => consume(channel, msg));
}).catch(err => {
    console.error('Failed to set up AMQP channel', err);
    process.exit(1);
});

http.createServer(async (req, res) => {
    if (req.url === '/healthz') {
        res.writeHead(200);
        return res.end('ok');
    }
    if (req.url === '/readyz') {
        res.writeHead(amqpConnected ? 200 : 503);
        return res.end(amqpConnected ? 'ready' : 'not ready');
    }
    if (req.url === '/metrics') {
        res.writeHead(200, { 'Content-Type': register.contentType });
        return res.end(await register.metrics());
    }
    res.writeHead(404);
    res.end();
}).listen(3001, () => console.log('> actuator listening on :3001'));